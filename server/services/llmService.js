const axios = require('axios');

class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'ollama';
    this.ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'mistral';
    this.hfToken = process.env.HF_API_TOKEN || '';
    this.hfModel = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
  }

  /**
   * Generate a structured medical research response
   */
  async generateResponse(params) {
    const {
      userQuery,
      disease,
      publications,
      clinicalTrials,
      conversationHistory,
      patientName
    } = params;

    const systemPrompt = this._buildSystemPrompt();
    const userPrompt = this._buildUserPrompt({
      userQuery,
      disease,
      publications,
      clinicalTrials,
      patientName
    });

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history for context
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.role === 'assistant'
            ? msg.content.substring(0, 500) + '...'
            : msg.content
        });
      }
    }

    messages.push({ role: 'user', content: userPrompt });

    try {
      if (this.provider === 'ollama') {
        return await this._generateOllama(messages);
      } else if (this.provider === 'huggingface') {
        return await this._generateHuggingFace(messages);
      } else {
        return this._generateFallback(params);
      }
    } catch (error) {
      console.error('LLM generation error:', error.message);
      return this._generateFallback(params);
    }
  }

  async _generateOllama(messages) {
    const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
      model: this.ollamaModel,
      messages,
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.9,
        num_predict: 2000
      }
    }, { timeout: 120000 });

    return response.data.message?.content || 'Unable to generate response.';
  }

  async _generateHuggingFace(messages) {
    const prompt = messages.map(m => {
      if (m.role === 'system') return `<s>[INST] <<SYS>>\n${m.content}\n<</SYS>>`;
      if (m.role === 'user') return `${m.content} [/INST]`;
      if (m.role === 'assistant') return `${m.content}</s><s>[INST] `;
      return m.content;
    }).join('\n');

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${this.hfModel}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.3,
          top_p: 0.9,
          return_full_text: false
        }
      },
      {
        headers: { Authorization: `Bearer ${this.hfToken}` },
        timeout: 120000
      }
    );

    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      return response.data[0].generated_text;
    }
    throw new Error('Unexpected HuggingFace response format');
  }

  /**
   * Structured fallback - generates a well-formatted response
   * without LLM when the model is unavailable
   */
  _generateFallback(params) {
    const { userQuery, disease, publications, clinicalTrials, patientName } = params;

    let response = '';

    // Header
    const greeting = patientName ? `**For ${patientName}** — ` : '';
    response += `## 🏥 ${greeting}Research Summary: ${disease || userQuery}\n\n`;

    // Condition Overview
    response += `### 📋 Condition Overview\n`;
    response += `Based on your query about **${userQuery}**`;
    if (disease) response += ` related to **${disease}**`;
    response += `, here is a comprehensive summary of the latest research findings.\n\n`;

    // Research Insights
    if (publications && publications.length > 0) {
      response += `### 📚 Research Insights\n\n`;
      response += `We analyzed **${publications.length} relevant publications** from PubMed and OpenAlex. Here are the key findings:\n\n`;

      publications.slice(0, 6).forEach((pub, i) => {
        response += `**${i + 1}. ${pub.title}**\n`;
        if (pub.abstract) {
          const snippet = pub.abstract.substring(0, 200);
          response += `> ${snippet}...\n`;
        }
        response += `- *Authors:* ${(pub.authors || []).join(', ') || 'N/A'}\n`;
        response += `- *Year:* ${pub.year || 'N/A'} | *Source:* ${pub.source}\n`;
        response += `- *Link:* [View Publication](${pub.url})\n\n`;
      });
    }

    // Clinical Trials
    if (clinicalTrials && clinicalTrials.length > 0) {
      response += `### 🧪 Relevant Clinical Trials\n\n`;
      response += `Found **${clinicalTrials.length} clinical trials** that may be relevant:\n\n`;

      clinicalTrials.slice(0, 4).forEach((trial, i) => {
        response += `**${i + 1}. ${trial.briefTitle || trial.title}**\n`;
        response += `- *Status:* ${trial.status}\n`;
        response += `- *Phase:* ${trial.phase || 'N/A'}\n`;
        if (trial.locations && trial.locations[0] !== 'Not specified') {
          response += `- *Location:* ${trial.locations.slice(0, 2).join('; ')}\n`;
        }
        if (trial.contact && trial.contact !== 'Not available') {
          response += `- *Contact:* ${trial.contact}\n`;
        }
        response += `- *Link:* [View Trial](${trial.url})\n\n`;
      });
    }

    // Disclaimer
    response += `\n---\n*⚠️ This information is for research purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers.*`;

    return response;
  }

  _buildSystemPrompt() {
    return `You are Curalink, an AI Medical Research Assistant. Your role is to provide structured, accurate, research-backed medical information.

CRITICAL RULES:
1. ONLY use information from the provided research data (publications and clinical trials)
2. NEVER fabricate or hallucinate information
3. ALWAYS cite sources with titles and links
4. Structure your response clearly with sections
5. Be specific and personalized based on the user's condition
6. If information is insufficient, say so honestly
7. Add a medical disclaimer at the end

RESPONSE STRUCTURE:
1. **Condition Overview** — Brief context about the condition/topic
2. **Research Insights** — Key findings from publications with citations
3. **Clinical Trials** — Relevant ongoing/completed trials (if available)
4. **Key Takeaways** — Actionable summary
5. **Sources** — List of referenced publications

STYLE:
- Use markdown formatting
- Be concise but thorough
- Use medical terminology appropriately
- Personalize based on patient context when available`;
  }

  _buildUserPrompt(params) {
    const { userQuery, disease, publications, clinicalTrials, patientName } = params;

    let prompt = `## User Query\n`;
    if (patientName) prompt += `Patient: ${patientName}\n`;
    if (disease) prompt += `Condition of interest: ${disease}\n`;
    prompt += `Question: ${userQuery}\n\n`;

    // Add publications data
    if (publications && publications.length > 0) {
      prompt += `## Retrieved Research Publications (${publications.length} results)\n\n`;
      publications.forEach((pub, i) => {
        prompt += `### Publication ${i + 1}\n`;
        prompt += `- Title: ${pub.title}\n`;
        prompt += `- Authors: ${(pub.authors || []).join(', ')}\n`;
        prompt += `- Year: ${pub.year}\n`;
        prompt += `- Source: ${pub.source}\n`;
        prompt += `- URL: ${pub.url}\n`;
        if (pub.abstract) {
          prompt += `- Abstract: ${pub.abstract.substring(0, 400)}\n`;
        }
        prompt += '\n';
      });
    }

    // Add clinical trials data
    if (clinicalTrials && clinicalTrials.length > 0) {
      prompt += `## Retrieved Clinical Trials (${clinicalTrials.length} results)\n\n`;
      clinicalTrials.forEach((trial, i) => {
        prompt += `### Trial ${i + 1}\n`;
        prompt += `- Title: ${trial.title}\n`;
        prompt += `- Status: ${trial.status}\n`;
        prompt += `- Phase: ${trial.phase}\n`;
        prompt += `- Location: ${(trial.locations || []).join('; ')}\n`;
        prompt += `- Contact: ${trial.contact}\n`;
        prompt += `- URL: ${trial.url}\n`;
        if (trial.briefSummary) {
          prompt += `- Summary: ${trial.briefSummary.substring(0, 300)}\n`;
        }
        prompt += '\n';
      });
    }

    prompt += `\nPlease provide a comprehensive, well-structured research summary addressing the user's query. Use ONLY the data provided above. Cite sources with their titles and URLs.`;

    return prompt;
  }
}

module.exports = new LLMService();
