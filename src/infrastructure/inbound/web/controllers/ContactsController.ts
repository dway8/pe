import { IActivityRepository } from "@interfaces/persistence/IActivityRepository";
import { CreateOrUpdateActivity } from "@use_cases/contacts/CreateOrUpdateActivity";
import { GetAllActivities } from "@use_cases/contacts/GetAllActivities";
import { getUsernameFromReq } from "./utils";
import { GetAllPersons } from "@use_cases/contacts/GetAllPersons";
import { IPersonRepository } from "@interfaces/persistence/IPersonRepository";
import { ProjectDependencies } from "@config/projectDependencies";
import { SynchronizePerson } from "@use_cases/contacts/SynchronizePerson";
import { CreateOrUpdatePerson } from "@use_cases/contacts/CreateOrUpdatePerson";
import { ContactService } from "@domain/services/ContactService";
import { OrderService } from "@domain/services/OrderService";
import { PatchService } from "@domain/services/PatchService";
import { DeletePerson } from "@use_cases/contacts/DeletePerson";
import { UpdatePersonOwner } from "@use_cases/contacts/UpdatePersonOwner";
import { GetAllOrgs } from "@use_cases/contacts/GetAllOrgs";
import { IOrgRepository } from "@interfaces/persistence/IOrgRepository";
import { GetOrg } from "@use_cases/contacts/GetOrg";
import { CreateOrUpdateOrg } from "@use_cases/contacts/CreateOrUpdateOrg";
import { DeleteOrg } from "@use_cases/contacts/DeleteOrg";
import { SynchronizeOrg } from "@use_cases/contacts/SynchronizeOrg";
import { UpdateOrgOwner } from "@use_cases/contacts/UpdateOrgOwner";
import { UpdateOrgFavoriteLevel } from "@use_cases/contacts/UpdateOrgFavoriteLevel";
import { GenerateContactsExport } from "@use_cases/contacts/GenerateContactsExport";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";
import { IExcelExportService } from "@interfaces/export/IExcelExportService";
import { ICSVExportService } from "@interfaces/export/ICSVExportService";
import { IStorageService } from "@interfaces/IStorageService";
import { DownloadContactsExport } from "@use_cases/contacts/DownloadContactsExport";

export class ContactsController {
    LoggerService: any;
    ActivityRepository: IActivityRepository;
    PersonRepository: IPersonRepository;
    OrgRepository: IOrgRepository;
    ContactsService: ContactService;
    OrderService: OrderService;
    PatchService: PatchService;
    OrderRepository: IOrderRepository;
    Events: string[];
    ExcelExportService: IExcelExportService;
    CSVExportService: ICSVExportService;
    StorageService: IStorageService;

    constructor(dependencies: ProjectDependencies) {
        this.LoggerService = dependencies.LoggerService;
        this.ActivityRepository =
            dependencies.DatabaseService.ActivityRepository;
        this.PersonRepository = dependencies.DatabaseService.PersonRepository;
        this.OrgRepository = dependencies.DatabaseService.OrgRepository;
        this.ContactsService = dependencies.ContactsService;
        this.OrderService = dependencies.OrderService;
        this.Events = Object.keys(dependencies.CustomerOptions.events);
        this.ExcelExportService = dependencies.ExcelExportService;
        this.CSVExportService = dependencies.CSVExportService;
        this.StorageService = dependencies.StorageService;
    }

    getAllActivities = (_req, res, next) => {
        const GetAllActivitiesCommand = GetAllActivities(
            this.ActivityRepository
        );

        GetAllActivitiesCommand.Execute().then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    createOrUpdateActivity = (req, res, next) => {
        const CreateOrUpdateActivityCommand = CreateOrUpdateActivity(
            this.ActivityRepository,
            this.LoggerService
        );
        const { activity } = req.body;
        const username = getUsernameFromReq(req);
        CreateOrUpdateActivityCommand.Execute(activity, username).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    getAllPersons = (_req, res, next) => {
        const GetAllPersonsCommand = GetAllPersons(this.PersonRepository);

        GetAllPersonsCommand.Execute().then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    synchronizePerson = (req, res, next) => {
        const SynchronizePersonCommand = SynchronizePerson(
            this.LoggerService,
            this.ContactsService
        );

        const params = req.body;

        SynchronizePersonCommand.Execute(params).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    createOrUpdatePerson = (req, res, next) => {
        const CreateOrUpdatePersonCommand = CreateOrUpdatePerson(
            this.ContactsService,
            this.OrderService,
            this.PatchService,
            this.Events
        );
        const params = req.body;
        const username = getUsernameFromReq(req);
        CreateOrUpdatePersonCommand.Execute(params, username).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    deletePerson = (req, res, next) => {
        const DeletePersonCommand = DeletePerson(
            this.PersonRepository,
            this.LoggerService,
            this.Events
        );
        const { id } = req.params;
        DeletePersonCommand.Execute(id).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    updatePersonOwner = (req, res, next) => {
        const UpdatePersonOwnerCommand = UpdatePersonOwner(
            this.PersonRepository,
            this.ContactsService
        );
        const { id } = req.params;
        const { owner } = req.body;
        UpdatePersonOwnerCommand.Execute(id, owner).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    getAllOrgs = (_req, res, next) => {
        const GetAllOrgsCommand = GetAllOrgs(this.OrgRepository);

        GetAllOrgsCommand.Execute().then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    getOrg = (req, res, next) => {
        const GetOrgCommand = GetOrg(this.OrgRepository);

        const { id } = req.params;
        GetOrgCommand.Execute(id).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    createOrUpdateOrg = (req, res, next) => {
        const CreateOrUpdateOrgCommand = CreateOrUpdateOrg(
            this.ContactsService
        );
        const params = req.body;
        CreateOrUpdateOrgCommand.Execute(params).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    deleteOrg = (req, res, next) => {
        const DeleteOrgCommand = DeleteOrg(
            this.OrgRepository,
            this.LoggerService,
            this.Events
        );
        const { id } = req.params;
        DeleteOrgCommand.Execute(id).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    synchronizeOrg = (req, res, next) => {
        const SynchronizeOrgCommand = SynchronizeOrg(
            this.LoggerService,
            this.ContactsService
        );

        const params = req.body;

        SynchronizeOrgCommand.Execute(params).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    updateOrgOwner = (req, res, next) => {
        const UpdateOrgOwnerCommand = UpdateOrgOwner(this.OrgRepository);
        const { id } = req.params;
        const { owner } = req.body;
        UpdateOrgOwnerCommand.Execute(id, owner).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    updateOrgFavoriteLevel = (req, res, next) => {
        const UpdateOrgFavoriteLevelCommand = UpdateOrgFavoriteLevel(
            this.OrgRepository
        );
        const { id } = req.params;
        const { favorite } = req.body;
        UpdateOrgFavoriteLevelCommand.Execute(id, favorite).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    generateContactsExport = (req, res, next) => {
        const GenerateContactsExportCommand = GenerateContactsExport(
            this.ContactsService,
            this.OrderRepository,
            this.Events,
            this.ExcelExportService,
            this.CSVExportService,
            this.StorageService
        );
        const exportFormat = req.params.format || "csv";
        const params = req.body;
        GenerateContactsExportCommand.Execute(exportFormat, params).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    downloadContactsExport = (req, res, next) => {
        const DownloadContactsExportCommand = DownloadContactsExport(
            this.StorageService
        );
        const uid = req.params.uid;
        DownloadContactsExportCommand.Execute(uid).then(
            (response) => {
                return res.sendFile(
                    response.path,
                    {
                        headers: response.headers,
                    },
                    (e) => {
                        if (e) {
                            next(e);
                        }
                    }
                );
            },
            (err) => {
                next(err);
            }
        );
    };
}
