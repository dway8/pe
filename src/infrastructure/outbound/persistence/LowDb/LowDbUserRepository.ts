const _ = require("lodash");

import { User } from "@domain/entities/User";
import { IUserRepository } from "@interfaces/persistence/IUserRepository";

export class LowDbUserRepository implements IUserRepository {
    db: any;

    constructor(contactsDb) {
        this.db = contactsDb;
    }

    async getByUsername(username: string): Promise<User | null> {
        const user = this.db.get("users").find({ username }).value();
        return _.cloneDeep(user);
    }
}
