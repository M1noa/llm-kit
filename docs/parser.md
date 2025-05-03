# Parser Module Documentation

The parser module provides a unified interface for parsing various file types into text and structured data.

## Supported File Types

- PDF documents (`.pdf`)
- Word documents (`.docx`)
- CSV files (`.csv`)
- Images (`.png`, `.jpg`, `.jpeg`, `.bmp`, `.gif`) via OCR

## Installation

The module requires several dependencies:
```bash
npm install pdf-parse docx4js csv-parse tesseract.js
```

## Usage

### Basic Usage

```typescript
import { parse } from 'llm-search';

// Parse a file by path
const result = await parse('path/to/file.pdf');
console.log(result.text);

// Parse a buffer
const buffer = readFileSync('path/to/file.docx');
const result = await parse(buffer);
console.log(result.text);
```

### With Options

```typescript
// Parse CSV with custom options
const csvResult = await parse('data.csv', {
  csv: {
    delimiter: ';',
    columns: true
  }
});

// OCR with different language
const imageResult = await parse('image.png', {
  language: 'spa' // Spanish
});
```

## Return Type

The parser returns a `ParseResult` object:

```typescript
interface ParseResult {
  type: 'pdf' | 'docx' | 'csv' | 'image' | 'unknown';
  text: string;           // Extracted text content
  metadata?: any;         // File-specific metadata
  data?: any;            // Structured data (if available)
}
```

## File Type Specific Features

### PDF Files
- Extracts text content
- Provides metadata (page count, PDF info, version)
- Preserves document structure

### DOCX Files
- Extracts text content
- Handles document formatting
- Processes tables and structured content

### CSV Files
- Extracts raw text
- Provides structured data array
- Supports custom delimiters
- Optional column headers

### Images (OCR)
- Extracts text via Tesseract OCR
- Supports multiple languages
- Returns confidence scores
- Handles common image formats

## Error Handling

```typescript
try {
  const result = await parse('file.pdf');
} catch (error) {
  if (error.code === 'PDF_PARSE_ERROR') {
    // Handle PDF-specific error
  } else if (error.code === 'DOCX_PARSE_ERROR') {
    // Handle DOCX-specific error
  }
  // Generic error handling
  console.error(error.message);
}
```

## Supported Error Codes
- `PDF_PARSE_ERROR`: PDF parsing failed
- `DOCX_PARSE_ERROR`: DOCX parsing failed
- `CSV_PARSE_ERROR`: CSV parsing failed
- `IMAGE_PARSE_ERROR`: Image OCR failed
- `PARSE_ERROR`: Generic parsing error

## Language Support

For OCR (image parsing), the following languages are supported:
- English (default, 'eng')
- Spanish ('spa')
- French ('fra')
- German ('deu')
- And [many more](https://tesseract-ocr.github.io/tessdoc/Data-Files#data-files-for-version-400-november-29-2016)

## Performance Considerations

- Image OCR is CPU-intensive and may take longer
- Large PDFs may require more memory
- Consider using streams for large files
- CSV parsing is typically very fast

## Examples

### Parse PDF and Extract Text
```typescript
const result = await parse('document.pdf');
console.log(`Pages: ${result.metadata.pages}`);
console.log(`Text: ${result.text}`);
```

### Parse CSV with Custom Options
```typescript
const result = await parse('data.csv', {
  csv: {
    delimiter: ';',
    columns: true
  }
});
console.log(`Rows: ${result.metadata.rowCount}`);
console.log(`Data:`, result.data);
```

### OCR Image in Different Language
```typescript
const result = await parse('chinese-text.png', {
  language: 'chi_sim'
});
console.log(`Extracted Text: ${result.text}`);