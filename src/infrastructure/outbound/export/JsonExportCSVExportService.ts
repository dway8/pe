import * as jsonexport from "jsonexport";
import { Iconv } from "iconv";

import { ICSVExportService } from "@interfaces/export/ICSVExportService";

export class JsonExportCSVExportService implements ICSVExportService {
    createBuffer(
        data: Record<string, any>,
        headers: Record<string, any>,
        rename: Record<string, any>
    ): any {
        jsonexport(
            data,
            {
                forceTextDelimiter: true,
                rowDelimiter: ",",
                headers,
                rename,
            },
            function (e: string, csv) {
                if (e) {
                    throw Error("Error when converting json to csv: " + e);
                }
                const iconv = new Iconv("utf8", "utf16le");
                const buffer = Buffer.concat([
                    Buffer.from([0xff, 0xfe]),
                    iconv.convert(csv),
                ]);
                return buffer;
            }
        );
    }
}
