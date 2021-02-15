import { BillFile, BillRequest } from "@domain/entities/Bill";
import { Contract } from "@domain/entities/Contract";
import { Installment } from "@domain/entities/Installment";
import { Order } from "@domain/entities/Order";
import { Patch } from "@domain/entities/Patch";
import { Wallet } from "@domain/entities/Wallet";

export interface IOrderRepository {
    getEventOrders(event: string): Promise<Order[]>;

    getOrder(event: string, id: string): Promise<Order>;

    updateOrder(event: string, id: string, order: Order): Promise<Order>;

    createPatch(event: string, patch: Patch): Promise<Patch>;

    findPatchBy(
        event: string,
        params: Record<string, any>
    ): Promise<Patch | null>;

    getWalletForOrder(event: string, orderId: string): Promise<Wallet | null>;

    getContractsForOrder(event: string, orderId: string): Promise<Contract[]>;

    getBillsForOrder(event: string, orderId: string): Promise<BillFile[]>;

    getPendingBillRequestsForOrder(
        event: string,
        orderId: string
    ): Promise<BillRequest[]>;

    getInstallmentsForOrder(
        event: string,
        orderId: string
    ): Promise<Installment[]>;
}
