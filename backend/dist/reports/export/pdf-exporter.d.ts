export declare class PdfExporter {
    generate(params: {
        title: string;
        rows: Record<string, any>[];
    }): Promise<Buffer>;
}
