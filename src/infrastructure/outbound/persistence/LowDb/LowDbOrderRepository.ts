const _ = require("lodash");

import { BillFile, BillRequest } from "@domain/entities/Bill";
import { Contract } from "@domain/entities/Contract";
import { Installment } from "@domain/entities/Installment";
import { Order } from "@domain/entities/Order";
import { Patch } from "@domain/entities/Patch";
import { Wallet } from "@domain/entities/Wallet";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";

export class LowDbOrderRepository implements IOrderRepository {
    dbs: any;

    constructor(eventDbs: any[]) {
        this.dbs = eventDbs;
    }

    orders(event: string) {
        return this.dbs[event].get("orders");
    }

    patches(event: string) {
        return this.dbs[event].get("patches");
    }

    wallets(event: string) {
        return this.dbs[event].get("wallets");
    }

    contracts(event: string) {
        return this.dbs[event].get("contracts");
    }

    bills(event: string) {
        return this.dbs[event].get("bills");
    }

    billRequests(event: string) {
        return this.dbs[event].get("billRequests");
    }

    installments(event: string) {
        return this.dbs[event].get("installments");
    }

    async getEventOrders(event: string): Promise<Order[]> {
        return this.orders(event).value();
    }

    async getOrder(event: string, id: string): Promise<Order> {
        return _.cloneDeep(this.orders(event).getById(id).value());
    }

    async updateOrder(event: string, id: string, order: Order): Promise<Order> {
        return this.orders(event).updateById(id, order).write();
    }

    ////// PATCHES

    async createPatch(event: string, patch: Patch): Promise<Patch> {
        return this.patches(event).insert(patch).write();
    }

    async findPatchBy(
        event: string,
        params: Record<string, any>
    ): Promise<Patch | null> {
        return this.patches(event).find(params).value();
    }

    /////// WALLETS

    async getWalletForOrder(
        event: string,
        orderId: string
    ): Promise<Wallet | null> {
        const db = this.wallets(event);
        return this.wallets(event).find({ orderId }).value();
    }

    async getContractsForOrder(
        event: string,
        orderId: string
    ): Promise<Contract[]> {
        return this.contracts(event).filter({ orderId }).value();
    }

    /////// BILLS

    async getBillsForOrder(
        event: string,
        orderId: string
    ): Promise<BillFile[]> {
        return _.cloneDeep(this.bills(event).filter({ orderId }).value());
    }

    getPendingBillRequestsForOrder(
        event: string,
        orderId: string
    ): Promise<BillRequest[]> {
        return (
            this.billRequests(event).filter({ orderId, done: false }).value() ||
            []
        );
    }

    /////// INSTALLMENTS

    async getInstallmentsForOrder(
        event: string,
        orderId: string
    ): Promise<Installment[]> {
        return _.cloneDeep(
            this.installments(event).filter({ orderId }).value()
        );
    }
}
