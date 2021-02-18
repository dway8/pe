import { Action } from "@domain/entities/Action";
import { OrderStatus, SerializedOrder } from "@domain/entities/Order";
import { OrderSerializerService } from "@domain/services/OrderSerializerService";
import { OrderService } from "@domain/services/OrderService";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";

export const UpdateOrderStatus = (
    OrderRepository: IOrderRepository,
    OrderService: OrderService,
    OrderSerializerService: OrderSerializerService
) => {
    async function Execute(
        event: string,
        id: string,
        action: Action,
        status: OrderStatus,
        comment: string | undefined,
        actionComment: string | undefined,
        cancellationFeeHT: number | undefined
    ): Promise<SerializedOrder> {
        const order = await OrderRepository.getOrder(event, id);

        if (!order) {
            throw Error(`Order not found for id ${id}`);
        }

        const updatedOrder = await OrderService.updateOrderOnStatusChange(
            event,
            order,
            action,
            status,
            comment,
            actionComment,
            cancellationFeeHT
        );

        const so = await OrderSerializerService.serializeOrder(
            event,
            updatedOrder
        );

        return so;

        // TODO
        // await services.mailService.doMailingForAction(
        //     { action, order: newOrder },
        //     false
        // );

        // if (action === C.ADMIN_VALIDATED && newOrder.status === C.VALIDATED) {
        //     await services.orderService.validateOrder(newOrder, true);
        // }

        // if (
        //     action === C.ADMIN_SWITCHED_BACK_TO_DRAFT &&
        //     newOrder.status === C.DRAFT
        // ) {
        //     services.contractsService.resetContractForDraft(newOrder);
        // }

        // if (action === C.ADMIN_CANCELLED && newOrder.status === C.CANCELLED) {
        //     services.contractsService.cancelCurrentAmendmentIfPending(newOrder);
        //     await services.paymentService.cancelInstallments(
        //         newOrder,
        //         req.body.autoRefund,
        //         req.body.cancellationFeeTTC
        //     );
        // }

        // if (action === C.ADMIN_CANCELLED || action === C.ADMIN_DELETED) {
        //     const installments = services.orderService.getInstallmentsForOrder(
        //         order
        //     );
        //     const hasCB = (installments || []).reduce(
        //         (acc, item) => acc || C.MONO_CB === item.paymentMode,
        //         false
        //     );
        //     if (hasCB) {
        //         winston.error(
        //             `!!!ACHTUNG!!! Admin removed the order ${logOrderShort(
        //                 newOrder
        //             )} but some installments are with CB. We will have to go on Payline's website =(`,
        //             {
        //                 action,
        //                 orderId: newOrder.id,
        //                 installments,
        //             }
        //         );
        //     }
        // }

        // if (
        //     oldOrder.status === C.DRAFT &&
        //     ![C.DRAFT, C.DELETED].includes(newOrder.status)
        // ) {
        //     await services.contactsService.unsyncOrderContactsIfNeeded(
        //         newOrder
        //     );
        // }

        // const username = getUserNameFromReq(req);

        // let orgChanged = false;
        // let personChanged = false;
        // if (newOrder.status === C.DELETED) {
        //     const org = services.contactsService.getOrgForOrder(newOrder.id);
        //     if (org && org.unsynchronized) {
        //         orgChanged = await services.contactsService.lowerOrgUnSyncFlagIfNeeded(
        //             org,
        //             username
        //         );
        //     }
        //     const person = services.contactsService.getPersonForOrder(
        //         newOrder.id
        //     );
        //     if (person && person.unsynchronized) {
        //         personChanged = await services.contactsService.lowerPersonUnSyncFlagIfNeeded(
        //             person,
        //             username
        //         );
        //     }
        // }

        // newOrder = db.get("orders").find({ id }).value();

        // services.orderService.computePatchForOrder(
        //     oldOrder,
        //     newOrder,
        //     C.ORGANIZER,
        //     action,
        //     username
        // );

        // if (orgChanged) {
        //     winston.verbose('Sending "updatedOrg" tag through admin sse');

        //     services.sseService.sse.send(
        //         services.contactsService.getOrgForOrder(newOrder.id),
        //         "updatedOrg"
        //     );
        // }
        // if (personChanged) {
        //     winston.verbose('Sending "updatedPerson" tag through admin sse');

        //     services.sseService.sse.send(
        //         services.contactsService.getPersonForOrder(newOrder.id),
        //         "updatedPerson"
        //     );
        // }
    }

    return { Execute };
};
