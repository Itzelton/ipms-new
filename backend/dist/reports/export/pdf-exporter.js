"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExporter = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
class PdfExporter {
    async generate(params) {
        const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
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
exports.PdfExporter = PdfExporter;
