export type TabularRow = Record<string, any>;
export declare class ExcelExporter {
    generateWorkbook(params: {
        title: string;
        columns: {
            header: string;
            key: string;
        }[];
        rows: TabularRow[];
    }): Promise<Buffer>;
}
