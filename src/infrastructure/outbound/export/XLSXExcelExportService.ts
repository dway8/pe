import * as XLSX from "xlsx";
import { IExcelExportService } from "@interfaces/export/IExcelExportService";

export class XLSXExcelExportService implements IExcelExportService {
    createBuffer(
        data: Record<string, any>,
        headers: Record<string, any>,
        rename: Record<string, any>
    ): any {
        const doRenames = (headers, renames) => (item) => {
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                const rename = renames[i];
                item[rename] = item[header];
                delete item[header];
            }
            return item;
        };
        const renamedData = data.map(doRenames(headers, rename));
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(renamedData, rename);

        /* Add the worksheet to the workbook */
        XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
        const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        return buffer;
    }
}
