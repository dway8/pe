export type Installment = InflowInstallment | OutflowInstallment;

type OutflowInstallment = BaseInstallment & {
    type: "Outflow";
};

type InflowInstallment = BaseInstallment & {
    type: "Inflow";
    deadline: Deadline;
    paymentId?: string;
};

type BaseInstallment = {
    status?: string;
    amount: number;
    paymentMode: string;
    finalizedAt?: number;
    orderId: string;
    transactionId?: string;
};

export type Deadline = {
    deadlineType: string;
    date: number;
    days?: number;
};
