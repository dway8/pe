import { Org } from "@domain/entities/Contact";

export interface IOrgRepository {
    getAll(): Promise<Org[]>;

    getById(id: string): Promise<Org | null>;

    create(org: Record<string, any>): Promise<Org>;

    update(id: string, params: Record<string, any>): Promise<Org>;

    getOrgIdForOrder(orderId: string): Promise<string | null>;

    delete(org: Org): Promise<void>;
}
