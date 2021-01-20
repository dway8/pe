import { OrderStatus } from "@domain/entities/Order";
import { ILoggerService } from "@interfaces/ILoggerService";
import { IPersonRepository } from "@interfaces/persistence/IPersonRepository";

export const DeletePerson = (
    PersonRepository: IPersonRepository,
    LoggerService: ILoggerService,
    Events: string[]
) => {
    async function Execute(id: string): Promise<string> {
        LoggerService.verbose(`Trying to delete person ${id}`);

        const person = await PersonRepository.getById(id);
        if (!person) {
            throw new Error("Cannot find person!");
        }

        for (const orderId of person.orderIds || []) {
            for (const event of Events) {
                const order = await this.OrderRepository.get(event, orderId);
                if (order && order.status !== OrderStatus.DELETED) {
                    throw new Error("Person has linked orders!");
                }
            }
        }

        await PersonRepository.delete(person);

        return id;
    }

    return { Execute };
};
