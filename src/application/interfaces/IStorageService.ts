export interface IStorageService {
    storePlanBackground(event: string, data: string, filename: string): void;

    storeContactsExport(buffer: any, filename: string): void;

    getContactsExportFile(uid: string): string;
}
