import { Person } from "@domain/entities/Contact";
import { IPersonRepository } from "@interfaces/persistence/IPersonRepository";

export const GetAllPersons = (PersonRepository: IPersonRepository) => {
    async function Execute(): Promise<Person[]> {
        const persons = await PersonRepository.getAll();
        return persons;
    }

    return { Execute };
};
