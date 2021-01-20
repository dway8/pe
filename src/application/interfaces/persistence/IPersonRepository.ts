import { Person } from "@domain/entities/Contact";

export interface IPersonRepository {
    getAll(): Promise<Person[]>;

    getById(id: string): Promise<Person | null>;

    create(person: Record<string, any>): Promise<Person>;

    delete(person: Person): Promise<void>;

    update(id: string, params: Record<string, any>): Promise<Person>;

    getPersonIdForOrder(orderId: string): Promise<string | null>;
}
