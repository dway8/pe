import { Org } from "@domain/entities/Contact";
import { IOrgRepository } from "@interfaces/persistence/IOrgRepository";

export const UpdateOrgFavoriteLevel = (OrgRepository: IOrgRepository) => {
    async function Execute(id: string, favorite: string): Promise<Org> {
        const org = await OrgRepository.getById(id);

        if (!org) {
            throw new Error("Cannot find org!");
        }

        const updatedOrg = await OrgRepository.update(id, { favorite });

        return updatedOrg;
    }

    return { Execute };
};
