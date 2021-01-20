const _ = require("lodash");

import { Person } from "@domain/entities/Contact";
import { IPersonRepository } from "@interfaces/persistence/IPersonRepository";

export class LowDbPersonRepository implements IPersonRepository {
    personsDb: any;
    deletedPersonsDb: any;

    constructor(contactsDb) {
        this.personsDb = contactsDb.get("persons");
        this.deletedPersonsDb = contactsDb.get("deletedPersons");
    }

    async getAll(): Promise<Person[]> {
        return _.cloneDeep(this.personsDb.value());
    }

    getById(id: string): Promise<Person | null> {
        return this.personsDb.getById(id).value();
    }

    async create(person: Record<string, any>): Promise<Person> {
        return this.personsDb.insert(person).write();
    }

    async update(id: string, params: Record<string, any>): Promise<Person> {
        return this.personsDb.updateById(id, params).write();
    }

    async getPersonIdForOrder(orderId: string): Promise<string | null> {
        const person = this.personsDb
            .find((p) => (p.orderIds ? p.orderIds.includes(orderId) : false))
            .value();

        return person.id || null;
    }

    async delete(person: Person): Promise<void> {
        this.deletedPersonsDb.insert(person).write();
        this.personsDb.remove({ id: person.id }).write();
    }
}
