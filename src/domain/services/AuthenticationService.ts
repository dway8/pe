import { User } from "@domain/entities/User";
import { IUserRepository } from "@interfaces/persistence/IUserRepository";

export class AuthenticationService {
    UserRepository: IUserRepository;

    constructor(UserRepository: IUserRepository) {
        this.UserRepository = UserRepository;
    }

    async getUserFromUsername(username: string): Promise<User | null> {
        let user = await this.UserRepository.getByUsername(username);
        if (user) {
            user = this._cleanUser(user);
        }
        return user;
    }
    async getUserPasswordFromUsername(
        username: string
    ): Promise<string | null> {
        const user = await this.getUserFromUsername(username);
        if (user && user.password) {
            return user.password;
        }
        return null;
    }

    _cleanUser(user: User) {
        if (user.password) {
            delete user.password;
        }
        return user;
    }
}
