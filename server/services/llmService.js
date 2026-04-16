// const axios = require('axios');

// class LLMService {
//   constructor() {
//     this.provider = process.env.LLM_PROVIDER || 'ollama';
//     this.ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
//     this.ollamaModel = process.env.OLLAMA_MODEL || 'mistral';
//     this.hfToken = process.env.HF_API_TOKEN || '';
//     this.hfModel = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
//   }

//   /**
//    * Generate a structured medical research response
//    */
//   async generateResponse(params) {
//     const {
//       userQuery,
//       disease,
//       publications,
//       clinicalTrials,
//       conversationHistory,
//       patientName
//     } = params;

//     const systemPrompt = this._buildSystemPrompt();
//     const userPrompt = this._buildUserPrompt({
//       userQuery,
//       disease,
//       publications,
//       clinicalTrials,
//       patientName
//     });

//     const messages = [
//       { role: 'system', content: systemPrompt }
//     ];

//     // Add conversation history for context
//     if (conversationHistory && conversationHistory.length > 0) {
//       const recentHistory = conversationHistory.slice(-6);
//       for (const msg of recentHistory) {
//         messages.push({
//           role: msg.role,
//           content: msg.role === 'assistant'
//             ? msg.content.substring(0, 500) + '...'
//             : msg.content
//         });
//       }
//     }

//     messages.push({ role: 'user', content: userPrompt });

//     try {
//       if (this.provider === 'ollama') {
//         return await this._generateOllama(messages);
//       } else if (this.provider === 'huggingface') {
//         return await this._generateHuggingFace(messages);
//       } else {
//         return this._generateFallback(params);
//       }
//     } catch (error) {
//       console.error('LLM generation error:', error.message);
//       return this._generateFallback(params);
//     }
//   }

//   async _generateOllama(messages) {
//     const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
//       model: this.ollamaModel,
//       messages,
//       stream: false,
//       options: {
//         temperature: 0.3,
//         top_p: 0.9,
//         num_predict: 2000
//       }
//     }, { timeout: 120000 });

//     return response.data.message?.content || 'Unable to generate response.';
//   }

//   async _generateHuggingFace(messages) {
//     const prompt = messages.map(m => {
//       if (m.role === 'system') return `<s>[INST] <<SYS>>\n${m.content}\n<</SYS>>`;
//       if (m.role === 'user') return `${m.content} [/INST]`;
//       if (m.role === 'assistant') return `${m.content}</s><s>[INST] `;
//       return m.content;
//     }).join('\n');

//     const response = await axios.post(
//       `https://api-inference.huggingface.co/models/${this.hfModel}`,
//       {
//         inputs: prompt,
//         parameters: {
//           max_new_tokens: 2000,
//           temperature: 0.3,
//           top_p: 0.9,
//           return_full_text: false
//         }
//       },
//       {
//         headers: { Authorization: `Bearer ${this.hfToken}` },
//         timeout: 120000
//       }
//     );

//     if (Array.isArray(response.data) && response.data[0]?.generated_text) {
//       return response.data[0].generated_text;
//     }
//     throw new Error('Unexpected HuggingFace response format');
//   }

//   /**
//    * Structured fallback - generates a well-formatted response
//    * without LLM when the model is unavailable
//    */
//   _generateFallback(params) {
//     const { userQuery, disease, publications, clinicalTrials, patientName } = params;

//     let response = '';

//     // Header
//     const greeting = patientName ? `**For ${patientName}** — ` : '';
//     response += `## 🏥 ${greeting}Research Summary: ${disease || userQuery}\n\n`;

//     // Condition Overview
//     response += `### 📋 Condition Overview\n`;
//     response += `Based on your query about **${userQuery}**`;
//     if (disease) response += ` related to **${disease}**`;
//     response += `, here is a comprehensive summary of the latest research findings.\n\n`;

//     // Research Insights
//     if (publications && publications.length > 0) {
//       response += `### 📚 Research Insights\n\n`;
//       response += `We analyzed **${publications.length} relevant publications** from PubMed and OpenAlex. Here are the key findings:\n\n`;

//       publications.slice(0, 6).forEach((pub, i) => {
//         response += `**${i + 1}. ${pub.title}**\n`;
//         if (pub.abstract) {
//           const snippet = pub.abstract.substring(0, 200);
//           response += `> ${snippet}...\n`;
//         }
//         response += `- *Authors:* ${(pub.authors || []).join(', ') || 'N/A'}\n`;
//         response += `- *Year:* ${pub.year || 'N/A'} | *Source:* ${pub.source}\n`;
//         response += `- *Link:* [View Publication](${pub.url})\n\n`;
//       });
//     }

//     // Clinical Trials
//     if (clinicalTrials && clinicalTrials.length > 0) {
//       response += `### 🧪 Relevant Clinical Trials\n\n`;
//       response += `Found **${clinicalTrials.length} clinical trials** that may be relevant:\n\n`;

//       clinicalTrials.slice(0, 4).forEach((trial, i) => {
//         response += `**${i + 1}. ${trial.briefTitle || trial.title}**\n`;
//         response += `- *Status:* ${trial.status}\n`;
//         response += `- *Phase:* ${trial.phase || 'N/A'}\n`;
//         if (trial.locations && trial.locations[0] !== 'Not specified') {
//           response += `- *Location:* ${trial.locations.slice(0, 2).join('; ')}\n`;
//         }
//         if (trial.contact && trial.contact !== 'Not available') {
//           response += `- *Contact:* ${trial.contact}\n`;
//         }
//         response += `- *Link:* [View Trial](${trial.url})\n\n`;
//       });
//     }

//     // Disclaimer
//     response += `\n---\n*⚠️ This information is for research purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers.*`;

//     return response;
//   }

//   _buildSystemPrompt() {
//     return `You are Curalink, an AI Medical Research Assistant. Your role is to provide structured, accurate, research-backed medical information.

// CRITICAL RULES:
// 1. ONLY use information from the provided research data (publications and clinical trials)
// 2. NEVER fabricate or hallucinate information
// 3. ALWAYS cite sources with titles and links
// 4. Structure your response clearly with sections
// 5. Be specific and personalized based on the user's condition
// 6. If information is insufficient, say so honestly
// 7. Add a medical disclaimer at the end

// RESPONSE STRUCTURE:
// 1. **Condition Overview** — Brief context about the condition/topic
// 2. **Research Insights** — Key findings from publications with citations
// 3. **Clinical Trials** — Relevant ongoing/completed trials (if available)
// 4. **Key Takeaways** — Actionable summary
// 5. **Sources** — List of referenced publications

// STYLE:
// - Use markdown formatting
// - Be concise but thorough
// - Use medical terminology appropriately
// - Personalize based on patient context when available`;
//   }

//   _buildUserPrompt(params) {
//     const { userQuery, disease, publications, clinicalTrials, patientName } = params;

//     let prompt = `## User Query\n`;
//     if (patientName) prompt += `Patient: ${patientName}\n`;
//     if (disease) prompt += `Condition of interest: ${disease}\n`;
//     prompt += `Question: ${userQuery}\n\n`;

//     // Add publications data
//     if (publications && publications.length > 0) {
//       prompt += `## Retrieved Research Publications (${publications.length} results)\n\n`;
//       publications.forEach((pub, i) => {
//         prompt += `### Publication ${i + 1}\n`;
//         prompt += `- Title: ${pub.title}\n`;
//         prompt += `- Authors: ${(pub.authors || []).join(', ')}\n`;
//         prompt += `- Year: ${pub.year}\n`;
//         prompt += `- Source: ${pub.source}\n`;
//         prompt += `- URL: ${pub.url}\n`;
//         if (pub.abstract) {
//           prompt += `- Abstract: ${pub.abstract.substring(0, 400)}\n`;
//         }
//         prompt += '\n';
//       });
//     }

//     // Add clinical trials data
//     if (clinicalTrials && clinicalTrials.length > 0) {
//       prompt += `## Retrieved Clinical Trials (${clinicalTrials.length} results)\n\n`;
//       clinicalTrials.forEach((trial, i) => {
//         prompt += `### Trial ${i + 1}\n`;
//         prompt += `- Title: ${trial.title}\n`;
//         prompt += `- Status: ${trial.status}\n`;
//         prompt += `- Phase: ${trial.phase}\n`;
//         prompt += `- Location: ${(trial.locations || []).join('; ')}\n`;
//         prompt += `- Contact: ${trial.contact}\n`;
//         prompt += `- URL: ${trial.url}\n`;
//         if (trial.briefSummary) {
//           prompt += `- Summary: ${trial.briefSummary.substring(0, 300)}\n`;
//         }
//         prompt += '\n';
//       });
//     }

//     prompt += `\nPlease provide a comprehensive, well-structured research summary addressing the user's query. Use ONLY the data provided above. Cite sources with their titles and URLs.`;

//     return prompt;

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
   * Main method — generates response using configured LLM provider
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
      publications: (publications || []).slice(0, 4),
      clinicalTrials: (clinicalTrials || []).slice(0, 3),
      patientName
    });

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-4);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content.substring(0, 300)
        });
      }
    }

    messages.push({ role: 'user', content: userPrompt });

    console.log(`🤖 Using LLM provider: ${this.provider}`);

    try {
      if (this.provider === 'huggingface') {
        return await this._generateHuggingFace(messages);
      } else if (this.provider === 'ollama') {
        return await this._generateOllama(messages);
      } else {
        console.log('⚠️ Unknown provider, using fallback');
        return this._generateFallback(params);
      }
    } catch (error) {
      console.error('LLM generation error:', error.message);
      console.log('⚠️ Falling back to template response');
      return this._generateFallback(params);
    }
  }

  /**
   * HuggingFace Inference API
   */
  async _generateHuggingFace(messages) {
    if (!this.hfToken) {
      throw new Error('HuggingFace token not set');
    }

    console.log(`🤗 Calling HuggingFace model: ${this.hfModel}`);

    // Build prompt in Mistral Instruct format
    let prompt = '<s>';
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `[INST] <<SYS>>\n${msg.content}\n<</SYS>>\n\n`;
      } else if (msg.role === 'user') {
        prompt += `${msg.content} [/INST]`;
      } else if (msg.role === 'assistant') {
        prompt += ` ${msg.content}</s><s>[INST] `;
      }
    }

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${this.hfModel}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.3,
            top_p: 0.9,
            return_full_text: false,
            do_sample: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      // Handle response
      if (Array.isArray(response.data) && response.data[0]?.generated_text) {
        console.log('✅ HuggingFace responded successfully');
        return response.data[0].generated_text;
      }

      if (typeof response.data === 'string') {
        return response.data;
      }

      throw new Error('Unexpected HuggingFace response format');

    } catch (error) {
      // Model is loading — wait and retry
      if (error.response?.status === 503) {
        const waitTime = error.response?.data?.estimated_time || 30;
        console.log(`⏳ Model loading, waiting ${waitTime} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

        // Retry once
        const retryResponse = await axios.post(
          `https://api-inference.huggingface.co/models/${this.hfModel}`,
          {
            inputs: prompt,
            parameters: {
              max_new_tokens: 1000,
              temperature: 0.3,
              top_p: 0.9,
              return_full_text: false,
              do_sample: true
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.hfToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 120000
          }
        );

        if (Array.isArray(retryResponse.data) && retryResponse.data[0]?.generated_text) {
          console.log('✅ HuggingFace responded after retry');
          return retryResponse.data[0].generated_text;
        }
      }

      // Model requires Pro subscription
      if (error.response?.status === 403) {
        console.log('❌ Model requires Pro. Trying free model...');
        return await this._generateHuggingFaceFree(messages);
      }

      console.error('HuggingFace error:', error.response?.status, error.response?.data?.error || error.message);
      throw error;
    }
  }

  /**
   * Fallback to a free HuggingFace model if main model needs Pro
   */
  async _generateHuggingFaceFree(messages) {
    const freeModels = [
      'google/gemma-2-2b-it',
      'HuggingFaceH4/zephyr-7b-beta',
      'microsoft/Phi-3-mini-4k-instruct',
      'Qwen/Qwen2-1.5B-Instruct'
    ];

    for (const model of freeModels) {
      try {
        console.log(`🔄 Trying free model: ${model}`);

        const prompt = messages.map(m => {
          if (m.role === 'system') return `System: ${m.content}\n`;
          if (m.role === 'user') return `User: ${m.content}\n`;
          if (m.role === 'assistant') return `Assistant: ${m.content}\n`;
          return m.content;
        }).join('\n') + '\nAssistant:';

        const response = await axios.post(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            inputs: prompt,
            parameters: {
              max_new_tokens: 1000,
              temperature: 0.3,
              return_full_text: false
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.hfToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 60000
          }
        );

        if (Array.isArray(response.data) && response.data[0]?.generated_text) {
          console.log(`✅ Free model ${model} worked!`);
          return response.data[0].generated_text;
        }
      } catch (err) {
        console.log(`❌ ${model} failed:`, err.response?.status || err.message);
        continue;
      }
    }

    throw new Error('All HuggingFace models failed');
  }

  /**
   * Ollama local LLM
   */
  async _generateOllama(messages) {
    console.log(`🦙 Calling Ollama: ${this.ollamaModel}`);

    // Try /api/chat first
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: this.ollamaModel,
        messages,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 800
        }
      }, { timeout: 300000 });

      if (response.data?.message?.content) {
        console.log('✅ Ollama /api/chat worked');
        return response.data.message.content;
      }
    } catch (err) {
      console.log('❌ /api/chat failed:', err.response?.status || err.message);
    }

    // Try /api/generate
    try {
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.ollamaModel,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 800
        }
      }, { timeout: 300000 });

      if (response.data?.response) {
        console.log('✅ Ollama /api/generate worked');
        return response.data.response;
      }
    } catch (err) {
      console.log('❌ /api/generate failed:', err.response?.status || err.message);
    }

    // Try OpenAI-compatible endpoint
    try {
      const response = await axios.post(`${this.ollamaUrl}/v1/chat/completions`, {
        model: this.ollamaModel,
        messages,
        temperature: 0.3,
        max_tokens: 800
      }, { timeout: 300000 });

      if (response.data?.choices?.[0]?.message?.content) {
        console.log('✅ Ollama /v1/chat/completions worked');
        return response.data.choices[0].message.content;
      }
    } catch (err) {
      console.log('❌ /v1/chat/completions failed:', err.response?.status || err.message);
    }

    throw new Error('All Ollama endpoints failed');
  }

  /**
   * Fallback — generates structured response WITHOUT any LLM
   */
  _generateFallback(params) {
    const { userQuery, disease, publications, clinicalTrials, patientName } = params;

    let response = '';

    const greeting = patientName ? `**For ${patientName}** — ` : '';
    response += `## 🏥 ${greeting}Research Summary: ${disease || userQuery}\n\n`;

    response += `### 📋 Condition Overview\n`;
    response += `Based on your query about **${userQuery}**`;
    if (disease) response += ` related to **${disease}**`;
    response += `, here is a comprehensive summary of the latest research findings.\n\n`;

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

    response += `\n---\n*⚠️ This information is for research purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers.*`;

    return response;
  }

  _buildSystemPrompt() {
    return `You are Curalink, an AI Medical Research Assistant. Provide structured, accurate, research-backed medical information.

RULES:
1. ONLY use information from the provided research data
2. NEVER fabricate or hallucinate information
3. ALWAYS cite sources with titles and links
4. Structure response with clear sections
5. Be specific and personalized based on user condition
6. Add medical disclaimer at the end

RESPONSE FORMAT:
1. **Condition Overview** - Brief context
2. **Research Insights** - Key findings with citations
3. **Clinical Trials** - Relevant trials if available
4. **Key Takeaways** - Actionable summary

Keep response concise but thorough. Use markdown formatting.`;
  }

  _buildUserPrompt(params) {
    const { userQuery, disease, publications, clinicalTrials, patientName } = params;

    let prompt = `## Query\n`;
    if (patientName) prompt += `Patient: ${patientName}\n`;
    if (disease) prompt += `Condition: ${disease}\n`;
    prompt += `Question: ${userQuery}\n\n`;

    if (publications && publications.length > 0) {
      prompt += `## Research Publications (${publications.length} results)\n\n`;
      publications.forEach((pub, i) => {
        prompt += `${i + 1}. "${pub.title}"\n`;
        prompt += `   Authors: ${(pub.authors || []).slice(0, 2).join(', ')}\n`;
        prompt += `   Year: ${pub.year} | Source: ${pub.source}\n`;
        prompt += `   URL: ${pub.url}\n`;
        if (pub.abstract) {
          prompt += `   Summary: ${pub.abstract.substring(0, 200)}\n`;
        }
        prompt += '\n';
      });
    }

    if (clinicalTrials && clinicalTrials.length > 0) {
      prompt += `## Clinical Trials (${clinicalTrials.length} results)\n\n`;
      clinicalTrials.forEach((trial, i) => {
        prompt += `${i + 1}. "${trial.briefTitle || trial.title}"\n`;
        prompt += `   Status: ${trial.status}\n`;
        prompt += `   URL: ${trial.url}\n`;
        if (trial.briefSummary) {
          prompt += `   Summary: ${trial.briefSummary.substring(0, 150)}\n`;
        }
        prompt += '\n';
      });
    }

    prompt += `\nProvide a structured research summary. Cite sources with titles and URLs. Be concise.`;

    return prompt;
  }
}

module.exports = new LLMService();
 
