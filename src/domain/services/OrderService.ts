import { Order } from "@domain/entities/Order";
import { Patch } from "@domain/entities/Patch";
import { ILoggerService } from "@interfaces/ILoggerService";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";
import { ISSEService } from "@interfaces/ISSEService";
import { OrderSerializerService } from "./OrderSerializerService";
import { PatchService } from "./PatchService";

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
}
