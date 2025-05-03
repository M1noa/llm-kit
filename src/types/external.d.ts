declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    text: string;
    info: any;
    metadata: any;
    version: string;
  }

  function PDFParse(dataBuffer: Buffer): Promise<PDFData>;
  export default PDFParse;
}

declare module 'docx4js' {
  interface DocxDocument {
    officeDocument: {
      content: () => any;
    };
  }
  export function load(buffer: Buffer): Promise<DocxDocument>;
}

declare module 'mammoth' {
  interface ExtractResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
      [key: string]: any;
    }>;
  }

  interface Options {
    buffer?: Buffer;
    path?: string;
    [key: string]: any;
  }

  export function extractRawText(options: Options): Promise<ExtractResult>;
  export function convertToHtml(options: Options): Promise<ExtractResult>;
}

declare module 'tesseract.js' {
  interface WorkerOptions {
    logger?: (message: any) => void;
    errorHandler?: (error: any) => void;
  }

  interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
      words: any[];
    };
  }

  interface Worker {
    reinitialize(lang: string): Promise<void>;
    recognize(image: Buffer | string): Promise<RecognizeResult>;
    terminate(): Promise<void>;
  }

  export function createWorker(options?: WorkerOptions): Promise<Worker>;
}
