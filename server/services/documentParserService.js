const zlib = require('zlib');
const pdfParse = require('pdf-parse');
let PDFParser;
try {
  PDFParser = require('pdf2json');
} catch {
  PDFParser = null;
}

const ALLOWED_TYPES = {
  'text/plain': { ext: ['.txt'], label: 'TXT' },
  'application/pdf': { ext: ['.pdf'], label: 'PDF' }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

class DocumentParserService {
  validate(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File exceeds 10 MB limit' };
    }
    const mime = file.mimetype;
    if (!ALLOWED_TYPES[mime]) {
      return { valid: false, error: 'Only .txt and .pdf files are supported' };
    }
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    if (!ALLOWED_TYPES[mime].ext.includes(ext)) {
      return { valid: false, error: `File extension ${ext} does not match type ${ALLOWED_TYPES[mime].label}` };
    }
    return { valid: true };
  }

  async parse(file) {
    const validation = this.validate(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (file.mimetype === 'text/plain') {
      const text = file.buffer.toString('utf-8');
      if (!text.trim()) throw new Error('TXT file is empty');
      return text;
    }

    if (file.mimetype === 'application/pdf') {
      return this._parsePdf(file.buffer);
    }

    throw new Error('Unsupported file type');
  }

  async _parsePdf(buffer) {
    const errors = [];

    // Strategy 1: Standard pdf-parse (fast, handles standard documents)
    try {
      const result = await pdfParse(buffer);
      if (result && result.text && result.text.trim().length > 10) {
        return result.text.trim();
      }
    } catch (err) {
      errors.push(`pdf-parse error: ${err.message}`);
    }

    // Strategy 2: pdf2json (handles complex tokens, overcomes 128-char token limit)
    if (PDFParser) {
      try {
        const text = await this._parseWithPdf2Json(buffer);
        if (text && text.trim().length > 10) {
          return text.trim();
        }
      } catch (err) {
        errors.push(`pdf2json error: ${err.message || err}`);
      }
    }

    // Strategy 3: Resilient stream decompression & operator extraction
    try {
      const text = this._resilientStreamExtract(buffer);
      if (text && text.trim().length > 10) {
        return text.trim();
      }
    } catch (err) {
      errors.push(`stream extractor error: ${err.message}`);
    }

    // Strategy 4: Direct printable text scan (salvage human-readable blocks)
    try {
      const text = this._salvagePrintableRuns(buffer);
      if (text && text.trim().length > 20) {
        return text.trim();
      }
    } catch (err) {
      errors.push(`salvage error: ${err.message}`);
    }

    throw new Error(
      'Unable to extract text from PDF. The document may be password-protected or contain only scanned images without an OCR text layer.'
    );
  }

  _parseWithPdf2Json(buffer) {
    return new Promise((resolve, reject) => {
      const parser = new PDFParser(null, 1);
      const timeout = setTimeout(() => reject(new Error('pdf2json parsing timed out')), 12000);

      parser.on('pdfParser_dataError', err => {
        clearTimeout(timeout);
        reject(err.parserError || err);
      });

      parser.on('pdfParser_dataReady', () => {
        clearTimeout(timeout);
        try {
          const raw = parser.getRawTextContent() || '';
          const cleaned = raw
            .replace(/----------------Page \(\d+\) Break----------------/g, '\n\n')
            .replace(/\r\n/g, '\n');
          resolve(cleaned);
        } catch (e) {
          reject(e);
        }
      });

      parser.parseBuffer(buffer);
    });
  }

  _resilientStreamExtract(buffer) {
    const textChunks = [];
    let pos = 0;

    while (pos < buffer.length) {
      const streamIdx = buffer.indexOf(Buffer.from('stream'), pos);
      if (streamIdx === -1) break;

      let start = streamIdx + 6;
      if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) start += 2;
      else if (buffer[start] === 0x0a || buffer[start] === 0x0d) start += 1;

      const end = buffer.indexOf(Buffer.from('endstream'), start);
      if (end === -1) break;

      const chunk = buffer.subarray(start, end);
      let decomp = null;
      try {
        decomp = zlib.inflateSync(chunk);
      } catch {
        try {
          decomp = zlib.inflateRawSync(chunk);
        } catch {
          decomp = chunk;
        }
      }

      if (decomp) {
        const s = decomp.toString('latin1');
        // Extract (text) Tj
        const tjMatches = s.match(/\(([^)]+)\)\s*Tj/g);
        if (tjMatches) {
          for (const m of tjMatches) {
            const raw = m.replace(/\)\s*Tj$/, '').replace(/^\(/, '');
            const decoded = this._decodePdfString(raw).trim();
            if (decoded) textChunks.push(decoded);
          }
        }
        // Extract [(t1) 12 (t2)] TJ
        const tjArr = s.match(/\[(.*?)\]\s*TJ/g);
        if (tjArr) {
          for (const m of tjArr) {
            const inner = m.match(/\(([^)]+)\)/g);
            if (inner) {
              const combined = inner.map(x => this._decodePdfString(x.slice(1, -1))).join('').trim();
              if (combined) textChunks.push(combined);
            }
          }
        }
      }
      pos = end + 9;
    }

    return textChunks.join(' ');
  }

  _salvagePrintableRuns(buffer) {
    const str = buffer.toString('latin1');
    const matches = str.match(/[A-Za-z0-9\s.,!?:;'"\-–—()/[\]{}%@#&*+=]{6,}/g) || [];
    const validLines = matches
      .map(m => m.trim())
      .filter(m => {
        if (m.length < 6) return false;
        if (/^(obj|endobj|stream|endstream|xref|trailer|startxref)/i.test(m)) return false;
        if (/^\/[A-Za-z0-9_]+/.test(m)) return false;
        const letterCount = (m.match(/[A-Za-z]/g) || []).length;
        return letterCount / m.length >= 0.45;
      });
    return validLines.join('\n');
  }

  _decodePdfString(raw) {
    if (!raw) return '';
    return raw
      .replace(/\\([()\\])/g, '$1')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\b/g, '\b')
      .replace(/\\f/g, '\f')
      .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
  }
}

module.exports = new DocumentParserService();
