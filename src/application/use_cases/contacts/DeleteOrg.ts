import { OrderStatus } from "@domain/entities/Order";
import { ILoggerService } from "@interfaces/ILoggerService";
import { IOrgRepository } from "@interfaces/persistence/IOrgRepository";

export const DeleteOrg = (
    OrgRepository: IOrgRepository,
    LoggerService: ILoggerService,
    Events: string[]
) => {
    async function Execute(id: string): Promise<string> {
        LoggerService.verbose(`Trying to delete org ${id}`);

        const org = await OrgRepository.getById(id);
        if (!org) {
            throw new Error("Cannot find org!");
        }

        for (const orderId of org.orderIds || []) {
            for (const event of Events) {
                const order = await this.OrderRepository.get(event, orderId);
                if (order && order.status !== OrderStatus.DELETED) {
                    throw new Error("Org has linked orders!");
                }
            }
        }

        await OrgRepository.delete(org);

        return id;
    }

    return { Execute };
};
