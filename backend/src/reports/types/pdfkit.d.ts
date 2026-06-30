declare module 'pdfkit' {
  import { EventEmitter } from 'events';

  export interface PDFDocument extends EventEmitter {
    fontSize(size: number): this;
    text(text: string, options?: any): this;
    moveDown(height?: number): this;
    on(event: 'data', listener: (chunk: any) => void): this;
    on(event: 'end', listener: () => void): this;
    end(): void;
    moveTo(x: number, y: number): this;
  }

  export default class PDFDocumentConstructor {
    constructor(options?: any);
  }
}

