import ExcelJS from 'exceljs';

export type TabularRow = Record<string, any>;

export class ExcelExporter {
  async generateWorkbook(params: {
    title: string;
    columns: { header: string; key: string }[];
    rows: TabularRow[];
  }): Promise<Buffer> {
    const { title, columns, rows } = params;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(title);

    sheet.columns = columns;

    for (const row of rows) {
      sheet.addRow(row);
    }

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }
}

