import { User } from "@domain/entities/User";

export interface IUserRepository {
    getByUsername(username: string): Promise<User | null>;
}
