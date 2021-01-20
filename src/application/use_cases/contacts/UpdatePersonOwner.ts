import { SerializedPerson } from "@domain/entities/Contact";
import { ContactService } from "@domain/services/ContactService";
import { IPersonRepository } from "@interfaces/persistence/IPersonRepository";

export const UpdatePersonOwner = (
    PersonRepository: IPersonRepository,
    ContactService: ContactService
) => {
    async function Execute(
        id: string,
        owner: string
    ): Promise<SerializedPerson> {
        const person = await PersonRepository.getById(id);

        if (!person) {
            throw new Error("Cannot find person!");
        }

        const updatedPerson = await PersonRepository.update(id, { owner });

        return await ContactService.serializePerson(updatedPerson);
    }

    return { Execute };
};
