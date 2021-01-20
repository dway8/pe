export type BillFile = {
    id?: string;
    createdAt: number;
    updatedAt: number;
    filename: string;
    billNumber: string;
    amount?: number;
    comment?: string;
    contractId: string;
    bill?: Bill;
    type: string;
    orderId: string;
    generated: boolean;
};

export type Bill = {
    reference: string;
    vatNumber: string;
    entity: string;
    representative: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    siret: string;
    lines: Line[];
    installments: BillInstallment[];
    totalOwed: number;
    customerCode?: string;
};

type BillInstallment = {
    date: number;
    amount: number;
};

type Line = {
    id: string;
    reference: string;
    designation: string;
    quantity: number;
    unitPriceHT: number;
    vatRate: number;
    rebateHT: number;
};

export type BillRequest = {
    description: BillRequestDescription;
    orderId: string;
    done: boolean;
    date: number;
};

type BillRequestDescription = {
    customerName: string;
    event: string;
    adminUrl: string;
};

export enum BillRequestStatus {
    BILL_REQUESTED = "Requested",
    BILL_NOT_REQUESTED = "NotRequested",
}
