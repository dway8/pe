import { Org } from "@domain/entities/Contact";
import { IOrgRepository } from "@interfaces/persistence/IOrgRepository";

export const GetOrg = (OrgRepository: IOrgRepository) => {
    async function Execute(id: string): Promise<Org | null> {
        const org = await OrgRepository.getById(id);
        return org;
    }

    return { Execute };
};
