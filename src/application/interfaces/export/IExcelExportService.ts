export interface IExcelExportService {
    createBuffer(
        data: Record<string, any>,
        headers: Record<string, any>,
        rename: Record<string, any>
    ): any;
}
