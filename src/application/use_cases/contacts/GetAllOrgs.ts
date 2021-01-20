import { Org } from "@domain/entities/Contact";
import { IOrgRepository } from "@interfaces/persistence/IOrgRepository";

export const GetAllOrgs = (OrgRepository: IOrgRepository) => {
    async function Execute(): Promise<Org[]> {
        const orgs = await OrgRepository.getAll();
        return orgs;
    }

    return { Execute };
};
