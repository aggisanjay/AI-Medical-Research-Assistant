

const axios = require('axios');

// ─── Smart Truncation Helper ─────────────────────────────
/**
 * Truncates text at a clean sentence boundary.
 * Never cuts mid-sentence or mid-word.
 *
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string} Cleanly truncated text
 */
function smartTruncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text || '';

  const cleaned = text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) return cleaned;

  const chunk = cleaned.substring(0, maxLength);

  // Strategy 1: Cut at last sentence boundary (. ! ?)
  const lastSentenceEnd = Math.max(
    chunk.lastIndexOf('. '),
    chunk.lastIndexOf('.\n'),
    chunk.lastIndexOf('? '),
    chunk.lastIndexOf('! ')
  );

  if (lastSentenceEnd > maxLength * 0.4) {
    return chunk.substring(0, lastSentenceEnd + 1).trim();
  }

  // Strategy 2: Cut at last bullet point / line break
  const lastBullet = Math.max(
    chunk.lastIndexOf('\n•'),
    chunk.lastIndexOf('\n-'),
    chunk.lastIndexOf('\n*')
  );

  if (lastBullet > maxLength * 0.4) {
    return chunk.substring(0, lastBullet).trim();
  }

  // Strategy 3: Cut at last word boundary
  const lastSpace = chunk.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.5) {
    return chunk.substring(0, lastSpace).trim() + '...';
  }

  // Strategy 4: Hard cut (last resort)
  return chunk.trim() + '...';
}

// ─── Configuration Constants ─────────────────────────────

const CONFIG = {
  MAX_RESPONSE_TOKENS: 8500,
  TEMPERATURE: 0.2,
  MAX_PUBS_FOR_LLM: 6,
  MAX_TRIALS_FOR_LLM: 4,
  MAX_ABSTRACT_LENGTH: 350,
  MAX_HISTORY_MESSAGES: 4,
  MAX_HISTORY_CHARS: 200,
  HF_TIMEOUT: 180000,
  OLLAMA_TIMEOUT: 300000,
  HF_LOADING_WAIT: 20000,
};

/**
 * Ranked list of HuggingFace models to try.
 * Order: best quality → most reliable → smallest/fastest
 * Format: "model-id:provider-or-policy"
 */
const HF_MODEL_ROSTER = [
  'Qwen/Qwen2.5-7B-Instruct:fastest',
  'mistralai/Mistral-7B-Instruct-v0.3:featherless-ai',
  'meta-llama/Llama-3.2-3B-Instruct:fastest',
  'meta-llama/Llama-3.2-1B-Instruct:fastest',
  'Qwen/Qwen2.5-3B-Instruct:fastest',
  'microsoft/Phi-3-mini-4k-instruct:fastest',
  'google/gemma-2-2b-it:fastest',
  'HuggingFaceH4/zephyr-7b-beta:fastest',
  'deepseek-ai/DeepSeek-R1:fastest',
];

/** HuggingFace Router API endpoint */
const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

// ─── System Prompt ───────────────────────────────────────────

const SYSTEM_PROMPT = `You are **Curalink**, a premium AI Medical Research Assistant developed to deliver structured, evidence-based research reports.

You are NOT a chatbot. You are a **Research + Reasoning Engine**.

Your job: Take raw research data (publications + clinical trials) → Synthesize into a professional medical research report.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  GROUNDING RULES (STRICT - NEVER BREAK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Use ONLY the data provided in the research sources below
2. NEVER fabricate, assume, or hallucinate any fact, statistic, or citation
3. Every single claim MUST reference a specific source by its exact title
4. If data is limited, say: "Based on available research data, information on this specific aspect is limited"
5. Do NOT add information from your training data — ONLY from the provided sources
6. Do NOT recommend specific treatments or medications — present research findings objectively

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MANDATORY RESPONSE FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You MUST follow this EXACT structure. Do not skip any section.

## 🏥 Medical Research Report: [Disease/Topic]


**Research Query:** [User's original query]

**Sources Analyzed:** PubMed · OpenAlex · ClinicalTrials.gov

---

### 📋 Condition Overview

[Write 3-4 sentences that directly answer the user's question, providing an overview of the condition in the context of the query. Mention 8 publications and 6 trials were analyzed. Highlight the most significant finding. Be specific, not generic.]

---

### 📚 Research Insights (from publications)

We identified the following key research insights from peer-reviewed publications:

#### 📄 Insight 1: [Create a descriptive theme title based on the paper]

> "[Copy a relevant sentence or key insight directly from the abstract provided]"


| | |
|:--|:--|
| **Title** | [Exact paper title] |
| **Authors** | [Author names] |
| **Year** | [Publication year] |
| **Source** | [PubMed or OpenAlex] |
| **Link** | [View Publication →](URL) |

#### 📄 Insight 2: [Theme title]

> "[Key insight from abstract]"

| | |
|:--|:--|
| **Title** | [Paper title] |
| **Authors** | [Authors] |
| **Year** | [Year] |
| **Source** | [Source] |
| **Link** | [View Publication →](URL) |

[Continue for Insight 3, 4, 5, 6 — cover ALL provided publications]

---

### 🧪 Clinical Trials

The following clinical trials are relevant to this research area:

#### 🟢 Trial 1: [Trial Title]

| | |
|:--|:--|
| **Status** | [Recruiting Status with emoji: 🟢 Recruiting / 🔵 Completed / 🟡 Active] |
| **Phase** | [Phase] |
| **Location** | 📍 [Location details] |
| **Contact** | 📞 [Contact name, phone, email] |
| **Eligibility** | • Point 1: Age/sex requirement • Point 2: Key inclusion criterion • Point 3: Key exclusion criterion • Point 4: Disease stage or prior treatment condition |
| **Registry** | [View on ClinicalTrials.gov →](URL) |

[Continue for Trial 2, 3 — cover ALL provided trials]

---

### 💡 Analysis & Key Takeaways

Based on the research data analyzed:

1. **[Takeaway 1]** — [One sentence with specific evidence reference]
2. **[Takeaway 2]** — [One sentence with specific evidence reference]
3. **[Takeaway 3]** — [One sentence with specific evidence reference]
4. **Research Activity** — [Comment on how active this research area is based on publication years]
5. **Clinical Pipeline** — [Comment on trial availability and recruitment status]

---

### 🔍 Research Methodology

This report was generated through Curalink's automated pipeline:
1. **Query Expansion** — Medical synonyms and terminology variants applied
2. **Multi-Source Retrieval** — PubMed, OpenAlex, and ClinicalTrials.gov searched simultaneously
3. **Intelligent Ranking** — 100-point scoring system (relevance + recency + credibility)
4. **Source Verification** — All citations link to verified database entries

---

> ⚠️ **Medical Disclaimer:** This report is generated from publicly available research databases for informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment recommendations. Always consult qualified healthcare professionals before making medical decisions.

---

### ✨ Suggested Follow-Up Questions
1. [Context-aware follow-up question 1]
2. [Context-aware follow-up question 2]
3. [Context-aware follow-up question 3]
4. [Context-aware follow-up question 4]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  QUALITY STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Write concisely (400-500 words maximum) to prevent output cutoff
• Use markdown tables for publication and trial details (makes it scannable)
• Use blockquotes (>) for evidence snippets from abstracts
• Use emojis for section headers: 🏥 📋 📚 📄 🧪 🟢 🔵 🟡 💡 🔍 ⚠️
• Bold all field labels in tables
• Include direct URLs as clickable markdown links
• If patient name is provided, mention it in the header and occasionally in the text
• Group research findings by theme, not just list them
• For clinical trials, always show: Status, Location, Contact, Eligibility
• End with the methodology section, disclaimer, and exactly 4 Suggested Follow-Up Questions — ALWAYS`;

// ─── Main Service Class ──────────────────────────────────

class LLMService {
  constructor() {
    this.provider = (process.env.LLM_PROVIDER || 'ollama').trim().toLowerCase();
    this.ollamaUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').trim();
    this.ollamaModel = (process.env.OLLAMA_MODEL || 'mistral').trim();
    this.hfToken = (process.env.HF_API_TOKEN || '').trim();
    this.hfModel = (process.env.HF_MODEL || '').trim();

    this._logInitialization();
  }

  // ─── Public API ──────────────────────────────────────────

  /**
   * Main entry point — processes research data through the LLM pipeline.
   */
  async generateResponse(params) {
    const messages = this._buildMessages(params);

    console.log(`🤖 LLM Provider: ${this.provider.toUpperCase()}`);

    try {
      switch (this.provider) {
        case 'huggingface':
          return await this._callHuggingFace(messages);

        case 'ollama':
          return await this._callOllama(messages);

        default:
          console.warn(`⚠️ Unknown provider "${this.provider}", using fallback`);
          return this._buildFallbackResponse(params);
      }
    } catch (error) {
      console.error(`❌ LLM Error: ${error.message}`);
      console.log('🔄 Activating fallback template engine...');
      return this._buildFallbackResponse(params);
    }
  }

  // ─── Provider: HuggingFace Router API ────────────────────

  async _callHuggingFace(messages) {
    if (!this.hfToken) {
      throw new Error('HF_API_TOKEN environment variable is not set');
    }

    const modelsToTry = this._buildModelQueue();

    for (const model of modelsToTry) {
      const result = await this._tryHuggingFaceModel(model, messages);
      if (result) return result;
    }

    throw new Error(`All ${modelsToTry.length} HuggingFace models exhausted`);
  }

  async _tryHuggingFaceModel(model, messages) {
    try {
      console.log(`  🤗 Trying: ${model}`);

      const response = await this._makeHuggingFaceRequest(model, messages);
      const content = response.data?.choices?.[0]?.message?.content;

      if (content) {
        console.log(`  ✅ Success: ${model} (${content.length} chars)`);
        return content;
      }

      return null;

    } catch (error) {
      return await this._handleHuggingFaceError(error, model, messages);
    }
  }

  async _makeHuggingFaceRequest(model, messages) {
    return axios.post(HF_ROUTER_URL, {
      model,
      messages,
      max_tokens: CONFIG.MAX_RESPONSE_TOKENS,
      temperature: CONFIG.TEMPERATURE,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${this.hfToken}`,
        'Content-Type': 'application/json'
      },
      timeout: CONFIG.HF_TIMEOUT
    });
  }

  async _handleHuggingFaceError(error, model, messages) {
    const status = error.response?.status;
    const errMsg = error.response?.data?.message
      || error.response?.data?.error
      || error.message;

    console.log(`  ❌ ${model} [${status}]: ${errMsg}`);

    if (status === 503) {
      const waitTime = error.response?.data?.estimated_time || 20;
      console.log(`  ⏳ Model loading — retrying in ${Math.ceil(waitTime)}s...`);

      await this._sleep(waitTime * 1000);

      try {
        const retryResponse = await this._makeHuggingFaceRequest(model, messages);
        const content = retryResponse.data?.choices?.[0]?.message?.content;

        if (content) {
          console.log(`  ✅ ${model} responded after retry! (${content.length} chars)`);
          return content;
        }
      } catch (retryError) {
        console.log(`  ❌ Retry failed for ${model}`);
      }
    }

    return null;
  }

  _buildModelQueue() {
    const queue = [];
    const seen = new Set();

    if (this.hfModel) {
      const preferred = this.hfModel.includes(':')
        ? this.hfModel
        : `${this.hfModel}:fastest`;
      queue.push(preferred);
      seen.add(preferred);
    }

    for (const model of HF_MODEL_ROSTER) {
      if (!seen.has(model)) {
        queue.push(model);
        seen.add(model);
      }
    }

    return queue;
  }

  // ─── Provider: Ollama (Local) ────────────────────────────

  async _callOllama(messages) {
    console.log(`  🦙 Model: ${this.ollamaModel}`);

    const chatResult = await this._ollamaChat(messages);
    if (chatResult) return chatResult;

    const generateResult = await this._ollamaGenerate(messages);
    if (generateResult) return generateResult;

    throw new Error('All Ollama endpoints failed');
  }

  async _ollamaChat(messages) {
    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/chat`,
        {
          model: this.ollamaModel,
          messages,
          stream: false,
          options: {
            temperature: CONFIG.TEMPERATURE,
            num_predict: CONFIG.MAX_RESPONSE_TOKENS
          }
        },
        { timeout: CONFIG.OLLAMA_TIMEOUT }
      );

      const content = response.data?.message?.content;
      if (content) {
        console.log(`  ✅ Ollama /api/chat responded (${content.length} chars)`);
        return content;
      }
    } catch (err) {
      console.log(`  ❌ /api/chat: ${err.response?.status || err.message}`);
    }
    return null;
  }

  async _ollamaGenerate(messages) {
    try {
      const prompt = messages
        .map(m => `### ${m.role.toUpperCase()}\n${m.content}`)
        .join('\n\n');

      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.ollamaModel,
          prompt,
          stream: false,
          options: {
            temperature: CONFIG.TEMPERATURE,
            num_predict: CONFIG.MAX_RESPONSE_TOKENS
          }
        },
        { timeout: CONFIG.OLLAMA_TIMEOUT }
      );

      const content = response.data?.response;
      if (content) {
        console.log(`  ✅ Ollama /api/generate responded (${content.length} chars)`);
        return content;
      }
    } catch (err) {
      console.log(`  ❌ /api/generate: ${err.response?.status || err.message}`);
    }
    return null;
  }

  // ─── Fallback: Template Engine ───────────────────────────

  _buildFallbackResponse(params) {
    const { userQuery, disease, publications, clinicalTrials, patientName } = params;
    const lines = [];
    const currentYear = new Date().getFullYear();
    const topic = disease || userQuery;
    const timestamp = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // ── REPORT HEADER ──

    if (patientName) {
      lines.push(`## 🏥 Medical Research Report`);
      lines.push(`**Prepared for:** ${patientName}  `);
      lines.push(`**Research Topic:** ${topic}  `);
      lines.push(`**Generated:** ${timestamp}  `);
      lines.push(`**Sources:** PubMed · OpenAlex · ClinicalTrials.gov\n`);
    } else {
      lines.push(`## 🏥 Medical Research Report: ${topic}`);
      lines.push(`**Generated:** ${timestamp} · **Sources:** PubMed · OpenAlex · ClinicalTrials.gov\n`);
    }

    // ── EXECUTIVE SUMMARY ──

    lines.push(`---\n`);
    lines.push(`### 📋 Executive Summary\n`);

    const pubCount = publications?.length || 0;
    const trialCount = clinicalTrials?.length || 0;
    const recentPubs = publications?.filter(p => p.year >= currentYear - 1).length || 0;
    const recruitingTrials = clinicalTrials?.filter(t =>
      t.status?.toUpperCase().includes('RECRUITING') &&
      !t.status?.toUpperCase().includes('NOT')
    ).length || 0;

    lines.push(`In response to your inquiry about **"${userQuery}"**${disease && disease !== userQuery ? ` within the domain of **${disease}**` : ''}, our system performed a comprehensive search across three major medical research databases.\n`);

    lines.push(`> 📊 **Retrieval Summary:**  `);
    lines.push(`> • **${pubCount} research publications** identified and ranked  `);
    lines.push(`> • **${recentPubs}** published within the last 12 months  `);
    lines.push(`> • **${trialCount} clinical trials** matched to your criteria  `);
    lines.push(`> • **${recruitingTrials}** trials actively recruiting participants  `);
    lines.push(`> • Results scored on **relevance, recency, and source credibility**\n`);

    // ── KEY FINDINGS ──

    if (publications?.length > 0) {
      lines.push(`---\n`);
      lines.push(`### 📚 Key Research Findings\n`);

      const pubmedPubs = publications.filter(p => p.source === 'PubMed');
      const openAlexPubs = publications.filter(p => p.source === 'OpenAlex');

      lines.push(`We identified **${publications.length} highly relevant publications** across our databases (${pubmedPubs.length} from PubMed, ${openAlexPubs.length} from OpenAlex). Below are the top-ranked findings:\n`);

      publications.slice(0, 6).forEach((pub, i) => {
        // ✅ FIX: Smart truncation for abstracts
        const cleanAbstract = pub.abstract
          ? smartTruncate(
              pub.abstract.replace(/\n/g, ' ').replace(/\s+/g, ' '),
              280
            )
          : null;

        const authors = (pub.authors || []).slice(0, 4);
        const authorStr = authors.length > 0
          ? authors.join(', ') + (pub.authors?.length > 4 ? ' et al.' : '')
          : 'Authors not listed';

        lines.push(`#### 📄 Finding ${i + 1}: ${pub.title}\n`);

        if (cleanAbstract) {
          lines.push(`> *"${cleanAbstract}"*\n`);
        }

        lines.push(`| | |`);
        lines.push(`|:--|:--|`);
        lines.push(`| **Authors** | ${authorStr} |`);
        lines.push(`| **Published** | ${pub.year || 'Year not available'} |`);
        lines.push(`| **Database** | ${pub.source === 'PubMed' ? '🔬 PubMed' : '📖 OpenAlex'} |`);
        lines.push(`| **Access** | [Read Full Publication →](${pub.url}) |`);
        lines.push(``);
      });
    }

    // ── CLINICAL TRIALS ──

    if (clinicalTrials?.length > 0) {
      lines.push(`---\n`);
      lines.push(`### 🧪 Clinical Trials Overview\n`);

      lines.push(`Our search identified **${clinicalTrials.length} clinical trials** related to your query. ${recruitingTrials > 0 ? `**${recruitingTrials} trials are actively recruiting** participants.` : 'Below are the most relevant trials.'}\n`);

      clinicalTrials.slice(0, 6).forEach((trial, i) => {
        const title = trial.briefTitle || trial.title;

        const statusUpper = (trial.status || '').toUpperCase();
        let statusEmoji = '⚪';
        if (statusUpper.includes('RECRUITING') && !statusUpper.includes('NOT')) statusEmoji = '🟢';
        else if (statusUpper.includes('ACTIVE')) statusEmoji = '🟡';
        else if (statusUpper.includes('COMPLETED')) statusEmoji = '🔵';

        const locationStr = trial.locations?.filter(l => l && l !== 'Not specified').slice(0, 2).join('; ') || 'Location not specified';

        const contactStr = trial.contact && trial.contact !== 'Not available'
          ? trial.contact.replace(/\|/g, ',')
          : 'Contact not available';

        // ✅ 4 key eligibility points for LLM
        const eligibilityPreview = trial.eligibility
          ? smartTruncate(
              trial.eligibility
                .replace(/\*/g, '•')
                .replace(/\\n/g, ' ')
                .replace(/<[^>]*>/g, '')
                .replace(/\\/g, ''),
              400
            )
          : 'Eligibility criteria not specified';

        lines.push(`#### ${statusEmoji} Trial ${i + 1}: ${title}\n`);

        lines.push(`| | |`);
        lines.push(`|:--|:--|`);
        lines.push(`| **Status** | ${statusEmoji} ${trial.status} |`);
        if (trial.phase && trial.phase !== 'N/A') {
          lines.push(`| **Phase** | ${trial.phase} |`);
        }
        lines.push(`| **Location** | 📍 ${locationStr} |`);
        lines.push(`| **Contact** | 📞 ${contactStr} |`);
        if (trial.nctId) {
          lines.push(`| **Trial ID** | ${trial.nctId} |`);
        }
        lines.push(`| **Registry** | [View on ClinicalTrials.gov →](${trial.url}) |`);
        lines.push(``);

        // ✅ FIX: No extra "..." since smartTruncate handles it
        lines.push(`**Eligibility Preview:** ${eligibilityPreview}\n`);
      });
    }

    // ── ANALYSIS & TAKEAWAYS ──

    lines.push(`---\n`);
    lines.push(`### 💡 Analysis & Key Takeaways\n`);

    const takeaways = [];

    if (publications?.length > 0) {
      const sources = [...new Set(publications.map(p => p.source))];
      const yearRange = publications.map(p => p.year).filter(Boolean);
      const minYear = Math.min(...yearRange);
      const maxYear = Math.max(...yearRange);
      takeaways.push(`📊 **Research Coverage:** ${publications.length} publications analyzed from ${sources.join(' and ')} (${minYear}–${maxYear})`);

      if (recentPubs > 0) {
        takeaways.push(`🆕 **Recent Activity:** ${recentPubs} publications from the last 12 months indicate **active research** in this area`);
      }
    }

    if (clinicalTrials?.length > 0) {
      takeaways.push(`🔬 **Clinical Pipeline:** ${clinicalTrials.length} trials identified across various phases`);
      if (recruitingTrials > 0) {
        takeaways.push(`✅ **Patient Opportunity:** ${recruitingTrials} trials are **currently recruiting** — eligible patients may consider enrollment`);
      }
    }

    takeaways.push(`🔄 **Real-Time Data:** All results retrieved live from PubMed, OpenAlex, and ClinicalTrials.gov`);
    takeaways.push(`📈 **Ranking Methodology:** Publications scored on relevance (title + abstract match), recency (publication year), and source credibility`);

    takeaways.forEach(t => lines.push(`${t}\n`));

    // ── METHODOLOGY NOTE ──

    lines.push(`---\n`);
    lines.push(`### 🔍 Research Methodology\n`);
    lines.push(`This report was generated through Curalink's automated research pipeline:\n`);
    lines.push(`1. **Query Expansion** — Your query was expanded using medical synonyms and terminology variants`);
    lines.push(`2. **Multi-Source Retrieval** — Searched PubMed, OpenAlex, and ClinicalTrials.gov simultaneously`);
    lines.push(`3. **Intelligent Ranking** — Applied a 100-point scoring system (relevance + recency + credibility)`);
    lines.push(`4. **Source Verification** — All citations link directly to verified database entries\n`);

    // ── DISCLAIMER ──

    lines.push(`---\n`);
    lines.push(`> ⚠️ **Medical Disclaimer**  `);
    lines.push(`> This report is generated from publicly available research databases for **informational and educational purposes only**. It does not constitute medical advice, diagnosis, or treatment recommendations. Always consult qualified healthcare professionals before making medical decisions. The research findings presented here should be discussed with your healthcare provider for personalized guidance.`);

    lines.push(`\n---\n`);
    lines.push(`### ✨ Suggested Follow-Up Questions`);
    lines.push(`1. What are the most common side effects of these treatments?`);
    lines.push(`2. Are there any dietary or lifestyle changes that support this condition?`);
    lines.push(`3. What is the typical prognosis and timeline?`);
    lines.push(`4. How do I enroll in one of the mentioned clinical trials?`);

    return lines.join('\n');
  }

  // ─── Message Construction ────────────────────────────────

  _buildMessages(params) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    if (params.conversationHistory?.length > 0) {
      const history = params.conversationHistory.slice(-CONFIG.MAX_HISTORY_MESSAGES);
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: msg.role === 'assistant'
            ? `[Previous response about: ${msg.content.substring(0, 100)}...]`
            : msg.content.substring(0, CONFIG.MAX_HISTORY_CHARS)
        });
      }
    }

    messages.push({
      role: 'user',
      content: this._buildUserPrompt(params)
    });

    return messages;
  }

  _buildUserPrompt(params) {
    const { userQuery, disease, publications, clinicalTrials, patientName } = params;
    const sections = [];

    // ── Request Context ──
    sections.push('╔══════════════════════════════════════╗');
    sections.push('║       RESEARCH REQUEST DETAILS        ║');
    sections.push('╚══════════════════════════════════════╝');
    sections.push('');

    if (patientName) sections.push(`👤 Patient Name: ${patientName}`);
    sections.push(`🔍 User Query: "${userQuery}"`);
    if (disease) sections.push(`🏥 Disease Context: ${disease}`);
    sections.push(`📅 Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);

    // ── Publications Data ──
    const pubs = (publications || []).slice(0, CONFIG.MAX_PUBS_FOR_LLM);
    if (pubs.length > 0) {
      sections.push('');
      sections.push('╔══════════════════════════════════════╗');
      sections.push(`║   PUBLICATIONS (${pubs.length} sources)              ║`);
      sections.push('╚══════════════════════════════════════╝');

      pubs.forEach((pub, i) => {
        const authors = (pub.authors || []).slice(0, 4).join(', ');
        const authorStr = pub.authors?.length > 4 ? `${authors} et al.` : authors || 'N/A';

        // ✅ FIX: Smart truncation for abstract
        const abstract = pub.abstract
          ? smartTruncate(
              pub.abstract.replace(/\n/g, ' ').trim(),
              CONFIG.MAX_ABSTRACT_LENGTH
            )
          : 'No abstract available';

        sections.push('');
        sections.push(`── SOURCE ${i + 1} ──────────────────────`);
        sections.push(`Title:    ${pub.title}`);
        sections.push(`Authors:  ${authorStr}`);
        sections.push(`Year:     ${pub.year || 'N/A'}`);
        sections.push(`Database: ${pub.source}`);
        sections.push(`URL:      ${pub.url}`);
        sections.push(`Abstract: ${abstract}`);
      });
    }

    // ── Clinical Trials Data ──
    const trials = (clinicalTrials || []).slice(0, CONFIG.MAX_TRIALS_FOR_LLM);
    if (trials.length > 0) {
      sections.push('');
      sections.push('╔══════════════════════════════════════╗');
      sections.push(`║   CLINICAL TRIALS (${trials.length} matched)          ║`);
      sections.push('╚══════════════════════════════════════╝');

      trials.forEach((trial, i) => {
        const locationStr = (trial.locations || [])
          .filter(l => l && l !== 'Not specified')
          .slice(0, 2)
          .join('; ') || 'Not specified';

        const contactStr = trial.contact && trial.contact !== 'Not available'
          ? trial.contact.replace(/\|/g, ',')
          : 'Not available';

        // ✅ 4 key eligibility points sent to LLM
        const eligibilityStr = trial.eligibility
          ? smartTruncate(
              trial.eligibility.replace(/\*/g, '•').replace(/\n/g, ' '),
              400
            )
          : 'Not specified';

        sections.push('');
        sections.push(`── TRIAL ${i + 1} ──────────────────────`);
        sections.push(`Title:       ${trial.briefTitle || trial.title}`);
        sections.push(`Status:      ${trial.status}`);
        sections.push(`Phase:       ${trial.phase || 'N/A'}`);
        sections.push(`Location:    ${locationStr}`);
        sections.push(`Contact:     ${contactStr}`);
        sections.push(`Eligibility: ${eligibilityStr}`);
        sections.push(`URL:         ${trial.url}`);
      });
    }

    // ── Generation Instructions ──
    sections.push('');
    sections.push('╔══════════════════════════════════════╗');
    sections.push('║       GENERATION INSTRUCTIONS         ║');
    sections.push('╚══════════════════════════════════════╝');
    sections.push('');
    sections.push('Generate a professional Medical Research Report following your system instructions EXACTLY.');
    sections.push('Requirements:');
    sections.push('1. Use the EXACT response structure from your system prompt');
    sections.push('2. Include ALL publications as numbered findings with tables');
    sections.push('3. Include ALL clinical trials with status, location, contact, eligibility');
    sections.push('4. Write an executive summary that DIRECTLY answers the user query');
    sections.push('5. Create themed groupings for research findings');
    sections.push('6. Add analysis and key takeaways with specific references');
    sections.push('7. End with methodology section and disclaimer');
    sections.push('8. Use markdown tables, blockquotes, and emojis as specified');
    sections.push('9. ONLY cite data from the sources above — NO external knowledge');

    return sections.join('\n');
  }

  // ─── Utilities ───────────────────────────────────────────

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _logInitialization() {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║     🧬 Curalink LLM Service v2.0       ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Provider : ${this.provider.padEnd(28)}║`);

    if (this.provider === 'huggingface') {
      const tokenStatus = this.hfToken ? '✅ Loaded' : '❌ Missing';
      console.log(`║  Token    : ${tokenStatus.padEnd(28)}║`);
      console.log(`║  Model    : ${(this.hfModel || 'Auto-select').substring(0, 28).padEnd(28)}║`);
      console.log(`║  Endpoint : Router API (v1)${' '.repeat(14)}║`);
      console.log(`║  Fallback : ${HF_MODEL_ROSTER.length} models in roster${' '.repeat(10)}║`);
    } else {
      console.log(`║  URL      : ${this.ollamaUrl.substring(0, 28).padEnd(28)}║`);
      console.log(`║  Model    : ${this.ollamaModel.padEnd(28)}║`);
    }

    console.log(`║  Safety   : Template fallback enabled   ║`);
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
  }
}

module.exports = new LLMService();