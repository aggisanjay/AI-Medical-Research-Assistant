const TokenUsage = require('../models/TokenUsage');

// Industry standard pricing per 1 Million tokens (USD)
const PRICING_CATALOG = {
  // HuggingFace Router Open-Source Models
  'mistralai/Mistral-7B-Instruct-v0.3': { input: 0.10, output: 0.25, name: 'Mistral-7B-Instruct' },
  'meta-llama/Llama-3.2-3B-Instruct': { input: 0.06, output: 0.15, name: 'Llama-3.2-3B' },
  'meta-llama/Llama-3.2-1B-Instruct': { input: 0.04, output: 0.10, name: 'Llama-3.2-1B' },
  'meta-llama/Llama-3.1-8B-Instruct': { input: 0.08, output: 0.20, name: 'Llama-3.1-8B' },
  'Qwen/Qwen2.5-7B-Instruct': { input: 0.10, output: 0.25, name: 'Qwen-2.5-7B' },
  'google/gemma-2-2b-it': { input: 0.06, output: 0.15, name: 'Gemma-2-2B' },

  // Groq Fast Cloud Inference (Standard hosted open-source rates per 1M tokens)
  'qwen/qwen3.8-27b': { input: 0.35, output: 0.80, name: 'Groq Qwen-3.8-27B' },
  'openai/gpt-oss-120b': { input: 0.80, output: 1.50, name: 'Groq GPT-OSS-120B' },
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79, name: 'Groq Llama-3.3-70B' },
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08, name: 'Groq Llama-3.1-8B' },

  // Local Models (Free - 100% zero operating cost)
  'ollama': { input: 0.00, output: 0.00, name: 'Ollama Local' },
  'local-fallback': { input: 0.00, output: 0.00, name: 'Local Deterministic' },

  // Proprietary benchmark reference
  'gpt-4o': { input: 2.50, output: 10.00, name: 'OpenAI GPT-4o' }
};

class TokenCostService {
  constructor() {
    this.sessionCumulative = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      totalCostUSD: 0.0,
      queryCount: 0,
      recentQueries: []
    };
  }

  /**
   * Fast & accurate token estimator (~3.8 to 4 characters per token for English & biomedical text)
   */
  estimateTokens(text) {
    if (!text || typeof text !== 'string') return 0;
    // Word-based tokenization approximation + punctuation weighting
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    return Math.max(1, Math.round((words * 1.3 + chars / 4) / 2));
  }

  /**
   * Calculate precise token cost for an LLM interaction
   */
  calculateCost({
    model = 'mistralai/Mistral-7B-Instruct-v0.3',
    provider = 'huggingface',
    promptText = '',
    completionText = '',
    exactPromptTokens,
    exactCompletionTokens,
    promptTokens: directPromptTokens,
    completionTokens: directCompletionTokens
  }) {
    // 1. Determine tokens
    const promptTokens = exactPromptTokens ?? directPromptTokens ?? this.estimateTokens(promptText);
    const completionTokens = exactCompletionTokens ?? directCompletionTokens ?? this.estimateTokens(completionText);
    const totalTokens = promptTokens + completionTokens;

    // 2. Lookup model pricing
    let pricing = PRICING_CATALOG[model] || PRICING_CATALOG['mistralai/Mistral-7B-Instruct-v0.3'];
    if (provider === 'ollama' || provider === 'local') {
      pricing = PRICING_CATALOG['ollama'];
    }

    // 3. Compute cost (Cost = (tokens / 1,000,000) * rate)
    const promptCost = (promptTokens / 1_000_000) * pricing.input;
    const completionCost = (completionTokens / 1_000_000) * pricing.output;
    const costUSD = parseFloat((promptCost + completionCost).toFixed(6));

    // Proprietary reference cost (What GPT-4o would have cost)
    const gpt4oEquivalentCost = parseFloat(
      ((promptTokens / 1_000_000) * PRICING_CATALOG['gpt-4o'].input +
       (completionTokens / 1_000_000) * PRICING_CATALOG['gpt-4o'].output).toFixed(6)
    );

    const savingsUSD = parseFloat(Math.max(0, gpt4oEquivalentCost - costUSD).toFixed(6));
    const result = {
      promptTokens,
      completionTokens,
      totalTokens,
      costUSD,
      costFormatted: `$${costUSD.toFixed(5)}`,
      gpt4oEquivalentCost,
      savingsUSD,
      savingsFormatted: `$${savingsUSD.toFixed(5)}`,
      model: pricing.name || model,
      provider,
      pricingRates: {
        inputPerMillion: pricing.input,
        outputPerMillion: pricing.output
      },
      timestamp: new Date().toISOString()
    };

    // Update real-time session accumulation
    this.sessionCumulative.promptTokens += promptTokens;
    this.sessionCumulative.completionTokens += completionTokens;
    this.sessionCumulative.totalTokens += totalTokens;
    this.sessionCumulative.totalCostUSD = parseFloat(
      (this.sessionCumulative.totalCostUSD + costUSD).toFixed(6)
    );
    this.sessionCumulative.queryCount += 1;

    this.sessionCumulative.recentQueries.unshift({
      ...result,
      id: `tc-${Date.now()}`
    });
    if (this.sessionCumulative.recentQueries.length > 50) {
      this.sessionCumulative.recentQueries.pop();
    }

    return result;
  }

  /**
   * Persist token usage record directly into MongoDB TokenUsage collection
   */
  async recordTokenUsage({
    query = 'Medical Research Query',
    conversationId,
    userId = 'anonymous',
    tokenCost,
    durationMs = 0
  } = {}) {
    if (!tokenCost) return null;
    try {
      const doc = await TokenUsage.create({
        query: (query || 'Medical Research Query').substring(0, 300),
        conversationId,
        userId: userId || 'anonymous',
        model: tokenCost.model || 'qwen/qwen3.8-27b',
        provider: tokenCost.provider || 'groq',
        promptTokens: tokenCost.promptTokens || 0,
        completionTokens: tokenCost.completionTokens || 0,
        totalTokens: tokenCost.totalTokens || 0,
        costUSD: tokenCost.costUSD || 0.0,
        costFormatted: tokenCost.costFormatted || `$${(tokenCost.costUSD || 0).toFixed(5)}`,
        savingsUSD: tokenCost.savingsUSD || 0.0,
        savingsFormatted: tokenCost.savingsFormatted || `$${(tokenCost.savingsUSD || 0).toFixed(5)}`,
        durationMs: durationMs || 0,
        createdAt: new Date()
      });
      return doc;
    } catch (err) {
      console.warn('⚠️ TokenUsage save failed:', err.message);
      return null;
    }
  }

  /**
   * Get real-time cumulative token and cost metrics
   */
  getRealtimeMetrics() {
    const cumulative = {
      ...this.sessionCumulative,
      costFormatted: `$${this.sessionCumulative.totalCostUSD.toFixed(5)}`
    };
    return {
      sessionCumulative: cumulative,
      cumulative: cumulative, // Both keys for frontend compatibility
      pricingCatalog: PRICING_CATALOG
    };
  }
}

module.exports = new TokenCostService();
