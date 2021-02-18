import { Order, OrderStatus } from "@domain/entities/Order";
import { Patch } from "@domain/entities/Patch";
import { ILoggerService } from "@interfaces/ILoggerService";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";
import { ISSEService } from "@interfaces/ISSEService";
import { OrderSerializerService } from "./OrderSerializerService";
import { PatchService } from "./PatchService";
import { Action } from "@domain/entities/Action";

type Result = ResultSuccess | ResultError;
type ResultSuccess = { success: true; data: Record<string, any> };
type ResultError = { success: false; error?: string };

export class OrderService {
    OrderRepository: IOrderRepository;
    LoggerService: ILoggerService;
    PatchService: PatchService;
    SSEService: ISSEService;
    OrderSerializerService: OrderSerializerService;

    constructor(
        OrderRepository: IOrderRepository,
        LoggerService: ILoggerService,
        PatchService: PatchService,
        SSEService: ISSEService,
        OrderSerializerService: OrderSerializerService
    ) {
        this.OrderRepository = OrderRepository;
        this.LoggerService = LoggerService;
        this.PatchService = PatchService;
        this.SSEService = SSEService;
        this.OrderSerializerService = OrderSerializerService;
    }

    async updateOrderContactInfo(
        event: string,
        order: Order,
        params: Record<string, any>
    ): Promise<Result> {
        const userInfo = {
            ...order.userInfo,
            ...params,
        };
        const newOrder = await this.OrderRepository.updateOrder(
            event,
            order.id,
            {
                ...order,
                userInfo,
            }
        );

        return { success: true, data: { newOrder } };
    }

    notifyUsersOfUpdatedOrder(
        event: string,
        order: Order,
        patch: Patch | null
    ): void {
        const obj: any = {
            order: this.OrderSerializerService.serializeOrder(event, order),
        };

        if (patch !== null) {
            obj.patch = this.PatchService.formatPatch(patch);
        }

        this.LoggerService.verbose(
            'Sending "updatedOrder" tag through admin sse'
        );
        this.SSEService.send(obj, "updatedOrder");
    }

    async updateOrderOnStatusChange(
        event: string,
        order: Order,
        action: Action,
        status: OrderStatus,
        comment: string | undefined,
        actionComment: string | undefined,
        cancellationFeeHT: number | undefined
    ): Promise<Order> {
        const now = new Date().getTime();
        let lastMessage = actionComment || null;
        if (
            status === OrderStatus.DELETED ||
            action === Action.ADMIN_ARCHIVED
        ) {
            lastMessage = null;
        }
        const notified = action === Action.ADMIN_NOTIFIED;
        const change: Record<string, any> = {
            status,
            comment,
            lastUpdate: now,
            lastMessage,
            notified: order.notified || notified,
            blocked:
                order.blocked && !(action === Action.ADMIN_AUTHORIZED_ACCESS),
        };

        if (
            action === Action.ADMIN_REFUSED ||
            action === Action.ADMIN_DELETED ||
            action === Action.ADMIN_CANCELLED
        ) {
            change.spotIds = [];
            change.assignmentShared = false;
            change.assignmentConfirmed = false;
        }

        if (action === Action.ADMIN_CANCELLED) {
            change.cancellationFeeHT = cancellationFeeHT || 0;
        }

        if (action === Action.ADMIN_ARCHIVED) {
            change.archived = true;
        }

        const newOrder = await this.OrderRepository.updateOrder(
            event,
            order.id,
            { ...order, ...change }
        );

        return newOrder;
    }
}
