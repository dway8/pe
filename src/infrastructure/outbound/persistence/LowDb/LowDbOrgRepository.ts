const _ = require("lodash");

import { Org } from "@domain/entities/Contact";
import { IOrgRepository } from "@interfaces/persistence/IOrgRepository";

export class LowDbOrgRepository implements IOrgRepository {
    orgsDb: any;
    deletedOrgsDb: any;

    constructor(contactsDb) {
        this.orgsDb = contactsDb.get("orgs");
        this.deletedOrgsDb = contactsDb.get("deletedOrgs");
    }

    async getAll(): Promise<Org[]> {
        return _.cloneDeep(this.orgsDb.value());
    }

    getById(id: string): Promise<Org | null> {
        return this.orgsDb.getById(id).value();
    }

    async create(org: Record<string, any>): Promise<Org> {
        return this.orgsDb.insert(org).write();
    }

    async update(id: string, params: Record<string, any>): Promise<Org> {
        return this.orgsDb.updateById(id, params).write();
    }

    async getOrgIdForOrder(orderId: string): Promise<string | null> {
        const org = this.orgsDb
            .find((p) => (p.orderIds ? p.orderIds.includes(orderId) : false))
            .value();

        return org.id || null;
    }

    async delete(org: Org): Promise<void> {
        this.deletedOrgsDb.insert(org).write();
        this.orgsDb.remove({ id: org.id }).write();
    }
}
