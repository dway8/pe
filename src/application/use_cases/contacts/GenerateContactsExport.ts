import { OrderStatus } from "@domain/entities/Order";
import { ContactService } from "@domain/services/ContactService";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";
import * as commonUtils from "@domain/commonUtils";
import { IExcelExportService } from "@interfaces/export/IExcelExportService";
import { ICSVExportService } from "@interfaces/export/ICSVExportService";
import { IStorageService } from "@interfaces/IStorageService";

export const GenerateContactsExport = (
    ContactService: ContactService,
    OrderRepository: IOrderRepository,
    Events: string[],
    ExcelExportService: IExcelExportService,
    CSVExportService: ICSVExportService,
    StorageService: IStorageService
) => {
    async function Execute(
        exportFormat: string,
        params: Record<string, any>
    ): Promise<string> {
        const {
            exportType,
            typologies,
            eventToEventTag,
            filteredIds,
            role,
        } = params;

        if (!["persons", "orgs", "orgs_for_emailing"].includes(exportType)) {
            throw new Error(
                `Received wrong exportType for contacts: ${exportType}`
            );
        }

        let exportInfo;
        switch (exportType) {
            case "persons":
                exportInfo = await ContactService.getFormattedPersons();
                break;
            case "orgs_for_emailing":
                exportInfo = ContactService.getFormattedPersonsForEmailing(
                    filteredIds,
                    role
                );
                break;
            case "orgs": {
                const orderIdToEventAndStatus = {};

                for (const event of Events) {
                    (await OrderRepository.getAllOrders(event)).map((order) => {
                        let status;
                        if (order.blocked) {
                            switch (order.status) {
                                case OrderStatus.DRAFT:
                                    status = "Requested";
                                    break;
                                case OrderStatus.REFUSED:
                                    status = "Rejected";
                                    break;
                                default:
                                    status = order.status;
                            }
                        } else {
                            status = order.status;
                        }

                        orderIdToEventAndStatus[order.id] = {
                            event,
                            status,
                        };
                    });
                }
                exportInfo = ContactService.getFormattedOrgs({
                    typologies,
                    eventToEventTag,
                    orderIdToEventAndStatus,
                    filteredIds,
                });
                break;
            }
        }
        const { data, headers, rename } = exportInfo;

        const filename = `${commonUtils.uuid()}.${exportFormat}`;
        let buf;

        switch (exportFormat) {
            case "xlsx": {
                buf = ExcelExportService.createBuffer(data, headers, rename);
                break;
            }
            case "csv":
            default: {
                buf = CSVExportService.createBuffer(data, headers, rename);
                break;
            }
        }
        StorageService.storeContactsExport(buf, filename);

        return filename;
    }

    return { Execute };
};
