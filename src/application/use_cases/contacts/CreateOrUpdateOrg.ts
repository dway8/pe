import { Author } from "@domain/entities/Author";
import { Org } from "@domain/entities/Contact";
import { ContactService } from "@domain/services/ContactService";

export const CreateOrUpdateOrg = (ContactsService: ContactService) => {
    async function Execute(params: Record<string, any>): Promise<Org> {
        const author = params.author || Author.ORGANIZER;

        const org = await ContactsService.createOrUpdateOrg(params, author);

        return org;
    }
    return { Execute };
};
