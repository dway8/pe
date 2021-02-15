import { Action } from "@domain/entities/Action";
import { Author } from "@domain/entities/Author";
import { Person } from "@domain/entities/Contact";
import { ContactService } from "@domain/services/ContactService";
import { OrderService } from "@domain/services/OrderService";
import { PatchService } from "@domain/services/PatchService";

export const CreateOrUpdatePerson = (
    ContactsService: ContactService,
    OrderService: OrderService,
    PatchService: PatchService,
    Events: string[]
) => {
    async function Execute(
        params: Record<string, any>,
        username: string | null
    ): Promise<Person> {
        const author = params.author || Author.ORGANIZER;

        const person = await ContactsService.createOrUpdatePerson(
            params,
            author
        );

        const newContactInfo = ContactsService.getOrderContactInfoFromPerson(
            person
        );

        const orderIds = person.orderIds || [];

        for (const orderId of orderIds) {
            let found = false;
            for (const event of Events) {
                const order = await this.OrderRepository.get(event, orderId);
                if (order) {
                    const result = await OrderService.updateOrderContactInfo(
                        event,
                        order,
                        newContactInfo
                    );

                    if (result.success && result.data.newOrder) {
                        const patch = await PatchService.computePatchForOrder(
                            event,
                            order,
                            result.data.newOrder,
                            Author.ORGANIZER,
                            Action.ADMIN_EDITED,
                            username
                        );

                        this.services.orderService.notifyUsersOfUpdatedOrder(
                            event,
                            result.data.newOrder,
                            patch
                        );

                        // TODO
                        // this.services.observerService.emit("poUpdated", [
                        //     result.data.newOrder,
                        // ]);
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.LoggerService.error(
                    `Order ${orderId} was not found in any event`
                );
            }
        }

        return person;
    }
    return { Execute };
};
