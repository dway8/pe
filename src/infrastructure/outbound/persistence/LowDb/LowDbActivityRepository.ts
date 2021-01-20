import { Activity } from "@domain/entities/Activity";
import { IActivityRepository } from "@interfaces/persistence/IActivityRepository";

export class LowDbActivityRepository implements IActivityRepository {
    db: any;

    constructor(contactsDb) {
        this.db = contactsDb.get("activities");
    }

    async getAll(): Promise<Activity[]> {
        return this.db.value();
    }

    create(params: Record<string, any>): Promise<Activity> {
        return this.db.insert(params).write();
    }

    update(id: string, params: Record<string, any>): Promise<Activity> {
        return this.db.updateById(id, params).write();
    }
}
