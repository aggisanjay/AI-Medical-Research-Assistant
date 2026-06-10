const pdfParse = require('pdf-parse');

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
      const result = await pdfParse(file.buffer);
      if (!result.text?.trim()) throw new Error('PDF contains no extractable text');
      return result.text;
    }

    throw new Error('Unsupported file type');
  }
}

module.exports = new DocumentParserService();
