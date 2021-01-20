import fs from "fs-extra";

import { IStorageService } from "@interfaces/IStorageService";
import config from "@src/config/config";

export class FileSystemStorageService implements IStorageService {
    getPlansDir(event: string): string {
        const uploadDir = `${config.rootDirectory}/${event}/uploads`;

        return `${uploadDir}/plans`;
    }

    getContactsExportDir(): string {
        return `${config.rootDirectory}/admin/csv`;
    }

    async storePlanBackground(
        event: string,
        data: string,
        filename: string
    ): Promise<void> {
        const path = this.getPlansDir(event) + "/" + filename;

        fs.writeFileSync(path, data, { encoding: "base64" });
    }

    storeContactsExport(buffer: any, filename: string): void {
        fs.writeFileSync(`${this.getContactsExportDir()}/${filename}`, buffer);
    }

    getContactsExportFile(uid: string): string {
        return `${this.getContactsExportDir()}/${uid}`;
    }
}
