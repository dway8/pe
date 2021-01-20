import { IStorageService } from "@interfaces/IStorageService";
import { ILoggerService } from "@interfaces/ILoggerService";
import { IDatabaseService } from "@interfaces/persistence/IDatabaseService";
import { LowDbDatabaseService } from "@infrastructure/outbound/persistence/LowDb/LowDbDatabaseService";
import { WinstonLoggerService } from "@infrastructure/outbound/logging/WinstonLoggerService";
import { FileSystemStorageService } from "@infrastructure/outbound/storage/FileSystemStorageService";
import { PlanService } from "@domain/services/PlanService";
import { AuthenticationService } from "@domain/services/AuthenticationService";
import { CustomerOptions } from "@domain/entities/CustomerOptions";
import { ContactService } from "@domain/services/ContactService";
import { OrderService } from "@domain/services/OrderService";
import { IDiffService } from "@interfaces/IDiffService";
import { JsonDiffPatchDiffService } from "@infrastructure/outbound/diff/JsonDiffPatchDiffService";
import { PatchService } from "@domain/services/PatchService";
import { ISSEService } from "@interfaces/ISSEService";
import { OrderSerializerService } from "@domain/services/OrderSerializerService";
import { IExcelExportService } from "@interfaces/export/IExcelExportService";
import { ICSVExportService } from "@interfaces/export/ICSVExportService";
import { XLSXExcelExportService } from "@infrastructure/outbound/export/XLSXExcelExportService";
import { JsonExportCSVExportService } from "@infrastructure/outbound/export/JsonExportCSVExportService";

export class ProjectDependencies {
    CustomerOptions: CustomerOptions;
    DatabaseService: IDatabaseService;
    PlanService: PlanService;
    LoggerService: ILoggerService;
    StorageService: IStorageService;
    AuthenticationService: AuthenticationService;
    ContactsService: ContactService;
    OrderService: OrderService;
    DiffService: IDiffService;
    PatchService: PatchService;
    SSEService: ISSEService;
    OrderSerializerService: OrderSerializerService;
    ExcelExportService: IExcelExportService;
    CSVExportService: ICSVExportService;

    constructor(customerOptions: CustomerOptions, adminDir: string) {
        this.CustomerOptions = customerOptions;
        this.DatabaseService = new LowDbDatabaseService(
            Object.keys(this.CustomerOptions.events),
            adminDir
        );
        this.StorageService = new FileSystemStorageService();
        this.LoggerService = new WinstonLoggerService();

        this.PlanService = new PlanService(this.DatabaseService.PlanRepository);
        this.AuthenticationService = new AuthenticationService(
            this.DatabaseService.UserRepository
        );
        this.ContactsService = new ContactService(
            this.DatabaseService.PersonRepository,
            this.DatabaseService.OrgRepository,
            this.LoggerService
        );

        this.PatchService = new PatchService(
            this.DatabaseService.OrderRepository,
            this.DiffService,
            this.LoggerService
        );
        this.OrderSerializerService = new OrderSerializerService(
            this.DatabaseService.OrderRepository,
            this.PatchService,
            this.DatabaseService.PlanRepository
        );
        this.OrderService = new OrderService(
            this.DatabaseService.OrderRepository,
            this.LoggerService,
            this.PatchService,
            this.SSEService,
            this.OrderSerializerService
        );
        this.DiffService = new JsonDiffPatchDiffService();

        this.ExcelExportService = new XLSXExcelExportService();
        this.CSVExportService = new JsonExportCSVExportService();
    }
}
