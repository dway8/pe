import { Action } from "@domain/entities/Action";
import { Author } from "@domain/entities/Author";
import { SerializedOrder } from "@domain/entities/Order";
import { OrderSerializerService } from "@domain/services/OrderSerializerService";
import { PatchService } from "@domain/services/PatchService";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";

export const UpdateOrderFavoriteLevel = (
    OrderRepository: IOrderRepository,
    OrderSerializerService: OrderSerializerService,
    PatchService: PatchService
) => {
    async function Execute(
        event: string,
        id: string,
        favorite: string,
        username: string | null
    ): Promise<SerializedOrder> {
        const order = await OrderRepository.getOrder(event, id);

        if (!order) {
            throw Error(`Order not found for id ${id}`);
        }

        const now = new Date().getTime();

        const updatedOrder = await OrderRepository.updateOrder(event, id, {
            ...order,
            lastUpdate: now,
            favorite,
        });

        await PatchService.computePatchForOrder(
            event,
            order,
            updatedOrder,
            Author.ORGANIZER,
            Action.ADMIN_SET_FAVORITE,
            username
        );

        const so = await OrderSerializerService.serializeOrder(
            event,
            updatedOrder
        );

        return so;
    }

    return { Execute };
};
