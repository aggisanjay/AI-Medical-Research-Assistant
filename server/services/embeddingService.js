const axios = require('axios');

/**
 * Embedding dimensions by provider:
 * - openai: 1536 (text-embedding-3-small)
 * - huggingface: 384 (all-MiniLM-L6-v2)
 * - local: 384 (deterministic hash — offline fallback)
 */
const PROVIDERS = {
  openai: { model: 'text-embedding-3-small', dimensions: 1536 },
  huggingface: { model: 'sentence-transformers/all-MiniLM-L6-v2', dimensions: 384 },
  local: { model: 'local-hash-v1', dimensions: 384 }
};

const HF_EMBED_URL =
  'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

class EmbeddingService {
  constructor() {
    this.provider = this._resolveProvider();
    this.config = PROVIDERS[this.provider];
    console.log(`📐 Embedding provider: ${this.provider} (${this.config.dimensions}d)`);
  }

  _resolveProvider() {
    const explicit = (process.env.EMBEDDING_PROVIDER || '').trim().toLowerCase();
    if (explicit && PROVIDERS[explicit]) return explicit;
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.HF_API_TOKEN) return 'huggingface';
    return 'local';
  }

  get dimensions() {
    return this.config.dimensions;
  }

  get modelName() {
    return this.config.model;
  }

  async embed(text) {
    const [vector] = await this.embedBatch([text]);
    return vector;
  }

  async embedBatch(texts) {
    switch (this.provider) {
      case 'openai':
        return this._embedOpenAI(texts);
      case 'huggingface':
        return this._embedHuggingFace(texts);
      default:
        return texts.map(t => this._embedLocal(t));
    }
  }

  async _embedOpenAI(texts) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is required for OpenAI embeddings');

    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      { model: PROVIDERS.openai.model, input: texts },
      {
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        timeout: 60000
      }
    );

    return response.data.data
      .sort((a, b) => a.index - b.index)
      .map(item => item.embedding);
  }

  async _embedHuggingFace(texts) {
    const token = process.env.HF_API_TOKEN;
    if (!token) throw new Error('HF_API_TOKEN is required for HuggingFace embeddings');

    const vectors = [];
    for (const text of texts) {
      const response = await axios.post(
        HF_EMBED_URL,
        { inputs: text, options: { wait_for_model: true } },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 120000
        }
      );
      vectors.push(this._meanPool(response.data));
    }
    return vectors;
  }

  _meanPool(data) {
    if (!Array.isArray(data)) return this._embedLocal('');
    if (typeof data[0] === 'number') return this._l2Normalize(data);
    const dim = data[0].length;
    const pooled = new Array(dim).fill(0);
    for (const row of data) {
      for (let i = 0; i < dim; i++) pooled[i] += row[i];
    }
    for (let i = 0; i < dim; i++) pooled[i] /= data.length;
    return this._l2Normalize(pooled);
  }

  /** Deterministic 384-d local fallback — no API key required */
  _embedLocal(text) {
    const dim = PROVIDERS.local.dimensions;
    const vector = new Array(dim).fill(0);
    const tokens = (text || '').toLowerCase().match(/[a-z0-9']+/g) || [];

    for (const token of tokens) {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash * 31 + token.charCodeAt(i)) % dim;
      }
      vector[hash] += 1;
      vector[(hash * 7 + 3) % dim] += 0.5;
    }

    return this._l2Normalize(vector);
  }

  _l2Normalize(vector) {
    let norm = 0;
    for (const v of vector) norm += v * v;
    norm = Math.sqrt(norm) || 1;
    return vector.map(v => v / norm);
  }

  cosineSimilarity(a, b) {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}

module.exports = new EmbeddingService();
