import { Author } from "@domain/entities/Author";
import { Org } from "@domain/entities/Contact";
import { ContactService } from "@domain/services/ContactService";
import { ILoggerService } from "@interfaces/ILoggerService";

export const SynchronizeOrg = (
    LoggerService: ILoggerService,
    ContactsService: ContactService
) => {
    async function Execute(params: Record<string, any>): Promise<Org> {
        LoggerService.verbose(`Synchronizing org ${params.org.id}`);
        const author = params.author || Author.ORGANIZER;

        const orgParams = ContactsService.transformOrderKeysToOrgKeys(
            params.org
        );

        orgParams["unsynchronized"] = false;

        LoggerService.verbose("Synchronizing with params: ", orgParams);

        const org = await ContactsService.createOrUpdateOrg(orgParams, author);

        return org;
    }
    return { Execute };
};
