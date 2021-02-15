import { SerializedOrder } from "@domain/entities/Order";
import { OrderSerializerService } from "@domain/services/OrderSerializerService";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";

export const GetAllOrders = (
    OrderRepository: IOrderRepository,
    OrderSerializerService: OrderSerializerService
) => {
    async function Execute(event: string): Promise<SerializedOrder[]> {
        const orders = await OrderRepository.getEventOrders(event);

        const serializedOrders: SerializedOrder[] = [];

        for (const order of orders) {
            const so = await OrderSerializerService.serializeOrder(
                event,
                order
            );
            serializedOrders.push(so);
        }

        return serializedOrders;
    }

    return { Execute };
};
