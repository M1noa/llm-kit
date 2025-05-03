# llm-search 🔍

> A Node.js module for searching and scraping web content, designed for LLMs but useful for everyone!

## Features

- 🌐 Search multiple engines (Google, DuckDuckGo)
- 📚 Wikipedia search and content extraction
- 💻 HackerNews integration 
- 📄 Webpage content extraction
- 📝 Document parsing (PDF, DOCX, CSV)
- 🖼️ Image OCR support
- ⚡ No API keys required
- 🔄 Automatic fallbacks
- 🎯 TypeScript support

## Installation

```bash
npm install llm-search

# Optional: Install OCR language data for non-English languages
npm install tesseract.js-data
```

## Quick Start

```typescript
import { search, parse } from 'llm-search';

// Web Search
const results = await search('typescript tutorial');
console.log(results);

// Parse Documents
const pdfResult = await parse('document.pdf');
console.log(pdfResult.text);

const csvResult = await parse('data.csv', {
  csv: { columns: true }
});
console.log(csvResult.data);

// OCR Images
const imageResult = await parse('image.png', {
  language: 'eng'
});
console.log(imageResult.text);
```

## Supported File Types

### Documents
- PDF files (`.pdf`)
- Word documents (`.docx`)
- CSV files (`.csv`)

### Images (OCR)
- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- BMP (`.bmp`)
- GIF (`.gif`)

## Documentation

See the [docs](./docs) directory for detailed documentation:

- [Search](./docs/search.md) - Web search capabilities
- [Wikipedia](./docs/wikipedia.md) - Wikipedia integration
- [HackerNews](./docs/hackernews.md) - HackerNews API
- [Webpage](./docs/webpage.md) - Web content extraction
- [Parser](./docs/parser.md) - Document and image parsing

## Example Usage

### Web Search
```typescript
import { search } from 'llm-search';

const results = await search('typescript tutorial');
console.log(results);
```

### Document Parsing
```typescript
import { parse } from 'llm-search';

// Parse PDF
const pdfResult = await parse('document.pdf');
console.log(pdfResult.text);

// Parse CSV with options
const csvResult = await parse('data.csv', {
  csv: {
    delimiter: ';',
    columns: true
  }
});
console.log(csvResult.data);

// OCR Image
const imageResult = await parse('image.png', {
  language: 'eng' // supports multiple languages
});
console.log(imageResult.text);
```

### Error Handling
```typescript
try {
  const result = await parse('document.pdf');
  console.log(result.text);
} catch (error) {
  if (error.code === 'PDF_PARSE_ERROR') {
    console.error('PDF parsing failed:', error.message);
  }
  // Handle other errors
}
```

## Dependencies

This package uses these great libraries:
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF parsing
- [docx4js](https://www.npmjs.com/package/docx4js) - DOCX parsing
- [csv-parse](https://www.npmjs.com/package/csv-parse) - CSV parsing
- [tesseract.js](https://www.npmjs.com/package/tesseract.js) - OCR
- [wikipedia](https://www.npmjs.com/package/wikipedia) - Wikipedia API
- [@mozilla/readability](https://www.npmjs.com/package/@mozilla/readability) - Web content extraction

## License

MIT

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.
