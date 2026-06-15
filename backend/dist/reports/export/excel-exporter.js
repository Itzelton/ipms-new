"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelExporter = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
class ExcelExporter {
    async generateWorkbook(params) {
        const { title, columns, rows } = params;
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet(title);
        sheet.columns = columns;
        for (const row of rows) {
            sheet.addRow(row);
        }
        return (await workbook.xlsx.writeBuffer());
    }
}
exports.ExcelExporter = ExcelExporter;
