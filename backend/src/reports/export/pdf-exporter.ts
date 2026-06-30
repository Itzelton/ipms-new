import PDFDocument from 'pdfkit';

// pdfkit is typed loosely here; we rely on runtime behavior.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPDFKitDocument = any;

export class PdfExporter {
  async generate(params: {
    title: string;
    rows: Record<string, any>[];
  }): Promise<Buffer> {
    const doc: AnyPDFKitDocument = new (PDFDocument as any)({ margin: 40, size: 'A4' });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: any) => chunks.push(chunk as Buffer));

    doc.fontSize(16).text(params.title, { align: 'left' });
    doc.moveDown();

    const rows = params.rows ?? [];
    const maxRows = Math.min(rows.length, 200);

    for (let i = 0; i < maxRows; i++) {
      const row = rows[i];
      doc.fontSize(10);
      doc.text(`Row ${i + 1}`);
      for (const [k, v] of Object.entries(row)) {
        doc.text(`- ${k}: ${v === undefined || v === null ? '' : String(v)}`);
      }
      doc.moveDown(0.5);
    }

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
}

