/**
 * Chunking strategy:
 * - Target ~500 words per chunk (~2,500 chars)
 * - 50-word overlap (~250 chars) for context continuity
 * - Prefer paragraph boundaries, then sentence boundaries
 */

const TARGET_CHARS = 2500;
const OVERLAP_CHARS = 250;
const MIN_CHUNK_CHARS = 100;

class ChunkingService {
  chunk(text) {
    const normalized = (text || '').replace(/\r\n/g, '\n').trim();
    if (!normalized) return [];

    const paragraphs = normalized.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    const chunks = [];
    let buffer = '';

    const flush = (overlapFromEnd = '') => {
      const piece = buffer.trim();
      if (piece.length >= MIN_CHUNK_CHARS) {
        chunks.push(piece);
      }
      buffer = overlapFromEnd;
    };

    for (const paragraph of paragraphs) {
      if ((buffer + '\n\n' + paragraph).length <= TARGET_CHARS) {
        buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
        continue;
      }

      if (buffer) flush(this._tail(buffer, OVERLAP_CHARS));

      if (paragraph.length <= TARGET_CHARS) {
        buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
      } else {
        const sentences = paragraph.match(/[^.!?]+[.!?]+|\S+/g) || [paragraph];
        for (const sentence of sentences) {
          if ((buffer + ' ' + sentence).length > TARGET_CHARS && buffer) {
            flush(this._tail(buffer, OVERLAP_CHARS));
          }
          buffer = buffer ? `${buffer} ${sentence.trim()}` : sentence.trim();
        }
      }
    }

    if (buffer.trim()) {
      chunks.push(buffer.trim());
    }

    return chunks.length > 0 ? chunks : [normalized.substring(0, TARGET_CHARS)];
  }

  _tail(text, maxChars) {
    if (text.length <= maxChars) return text;
    return text.slice(-maxChars);
  }

  estimateTokens(text) {
    return Math.ceil((text || '').split(/\s+/).filter(Boolean).length * 1.3);
  }
}

module.exports = new ChunkingService();
