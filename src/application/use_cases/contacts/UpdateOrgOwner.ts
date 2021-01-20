import { Org } from "@domain/entities/Contact";
import { IOrgRepository } from "@interfaces/persistence/IOrgRepository";

export const UpdateOrgOwner = (OrgRepository: IOrgRepository) => {
    async function Execute(id: string, owner: string): Promise<Org> {
        const org = await OrgRepository.getById(id);

        if (!org) {
            throw new Error("Cannot find org!");
        }

        const updatedOrg = await OrgRepository.update(id, { owner });

        return updatedOrg;
    }

    return { Execute };
};
