const low = require("lowdb");
import fs from "fs-extra";
const FileSync = require("lowdb/adapters/FileSync");
const lodashId = require("lodash-id");

import config from "@src/config/config.js";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";
import { IActivityRepository } from "@interfaces/persistence/IActivityRepository";
import { IUserRepository } from "@interfaces/persistence/IUserRepository";
import { IPersonRepository } from "@interfaces/persistence/IPersonRepository";
import { LowDbPlanRepository } from "./LowDbPlanRepository";
import { LowDbActivityRepository } from "./LowDbActivityRepository";
import { LowDbUserRepository } from "./LowDbUserRepository";
import { LowDbPersonRepository } from "./LowDbPersonRepository";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";
import { LowDbOrderRepository } from "./LowDbOrderRepository";
import { IOrgRepository } from "@interfaces/persistence/IOrgRepository";
import { LowDbOrgRepository } from "./LowDbOrgRepository";
import { IDatabaseService } from "@interfaces/persistence/IDatabaseService";

export class LowDbDatabaseService extends IDatabaseService {
    ContactsDb: any;
    PlanRepository: IPlanRepository;
    ActivityRepository: IActivityRepository;
    UserRepository: IUserRepository;
    PersonRepository: IPersonRepository;
    OrderRepository: IOrderRepository;
    OrgRepository: IOrgRepository;

    constructor(events: string[], adminDir: string) {
        super();

        this.initDatabase(events, adminDir);
    }

    initDatabase(events: string[], adminDir: string): void {
        const eventDbs = [];
        events.forEach((event) => {
            eventDbs[event] = this.initDbForEvent(event);
        });
        const adapter = new FileSync(`${adminDir}/dbContacts.json`);
        this.ContactsDb = low(adapter);
        this.ContactsDb._.mixin(lodashId);
        // Set some defaults (required if your JSON file is empty)
        this.ContactsDb.defaults({
            activities: [],
            persons: [],
            orgs: [],
            migrations: [],
            users: [],
            mergedPersons: [],
            mergedOrgs: [],
            deletedOrgs: [],
            deletedPersons: [],
        }).write();

        this.PlanRepository = new LowDbPlanRepository(eventDbs);
        this.ActivityRepository = new LowDbActivityRepository(this.ContactsDb);
        this.UserRepository = new LowDbUserRepository(this.ContactsDb);
        this.PersonRepository = new LowDbPersonRepository(this.ContactsDb);
        this.OrgRepository = new LowDbOrgRepository(this.ContactsDb);
        this.OrderRepository = new LowDbOrderRepository(eventDbs);
    }

    initDbForEvent(event: string) {
        const eventDirectory = `${config.rootDirectory}/${event}`;
        if (!fs.existsSync(eventDirectory)) {
            fs.mkdirsSync(eventDirectory);
        }

        const adapter = new FileSync(eventDirectory + "/db.json");
        const db = low(adapter);
        db._.mixin(lodashId);

        // Set some defaults (required if your JSON file is empty)
        db.defaults({
            orders: [],
            patches: [],
            wallets: [],
            contracts: [],
            deletedWallets: [],
            migrations: [],
            removedPayments: [],
            bills: [],
            exhibitorsDocs: [],
            spotReports: [],
            billRequests: [],
            installments: [],
        }).write();

        return db;
    }
}
