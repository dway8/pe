import { SerializedOrder } from "@domain/entities/Order";
import { OrderSerializerService } from "@domain/services/OrderSerializerService";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";

export const UpdateOrderPublicationStatus = (
    OrderRepository: IOrderRepository,
    OrderSerializerService: OrderSerializerService
) => {
    async function Execute(
        event: string,
        id: string,
        published: boolean
    ): Promise<SerializedOrder> {
        const order = await OrderRepository.getOrder(event, id);

        if (!order) {
            throw Error(`Order not found for id ${id}`);
        }

        const updatedOrder = await OrderRepository.updateOrder(event, id, {
            ...order,
            published,
        });

        const so = await OrderSerializerService.serializeOrder(
            event,
            updatedOrder
        );

        return so;
    }

    return { Execute };
};
