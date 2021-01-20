import { Author } from "@domain/entities/Author";
import { Person } from "@domain/entities/Contact";
import { ContactService } from "@domain/services/ContactService";
import { ILoggerService } from "@interfaces/ILoggerService";

export const SynchronizePerson = (
    LoggerService: ILoggerService,
    ContactsService: ContactService
) => {
    async function Execute(params: Record<string, any>): Promise<Person> {
        LoggerService.verbose(`Synchronizing person ${params.person.id}`);
        const author = params.author || Author.ORGANIZER;

        const personParams = ContactsService.transformOrderKeysToPersonKeys(
            params.person
        );

        personParams["unsynchronized"] = false;

        LoggerService.verbose("Synchronizing with params: ", personParams);

        const person = ContactsService.createOrUpdatePerson(
            personParams,
            author
        );

        return person;
    }
    return { Execute };
};
