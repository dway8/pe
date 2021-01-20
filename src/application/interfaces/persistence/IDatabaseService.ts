import { IPlanRepository } from "./IPlanRepository";
import { IActivityRepository } from "./IActivityRepository";
import { IUserRepository } from "./IUserRepository";
import { IPersonRepository } from "./IPersonRepository";
import { IOrderRepository } from "./IOrderRepository";
import { IOrgRepository } from "./IOrgRepository";

export class IDatabaseService {
    PlanRepository: IPlanRepository;
    ActivityRepository: IActivityRepository;
    UserRepository: IUserRepository;
    PersonRepository: IPersonRepository;
    OrderRepository: IOrderRepository;
    OrgRepository: IOrgRepository;

    constructor() {}

    initDatabase(events: string[], adminDir: string): void {}
}
