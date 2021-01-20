import { Activity } from "@domain/entities/Activity";

export interface IActivityRepository {
    getAll(): Promise<Activity[]>;

    create(params: Record<string, any>): Promise<Activity>;

    update(id: string, params: Record<string, any>): Promise<Activity>;
}
