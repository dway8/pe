import * as commonUtils from "@domain/commonUtils";
import { IStorageService } from "@interfaces/IStorageService";

export const DownloadContactsExport = (StorageService: IStorageService) => {
    async function Execute(
        uid: string
    ): Promise<{ path: string; headers: any }> {
        const [extension] = uid.split(".").slice(-1);
        const contentType =
            extension === "xlsx"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "text/csv; charset=utf-8";
        const filenames = commonUtils.sanitizeFilenameForContentDisposition(
            `export.${extension}`
        );

        const filePath = StorageService.getContactsExportFile(uid);

        return {
            path: filePath,
            headers: {
                "Content-Type": `${contentType}; header=present;`,
                "Content-Disposition": `attachment; ${filenames}`,
            },
        };
    }

    return { Execute };
};
