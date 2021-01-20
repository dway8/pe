import { BillFile } from "./Bill";
import { Contract } from "./Contract";
import { Installment } from "./Installment";

export type Order = {
    id: string;
    userInfo: any;
    archived: boolean;
    favorite: string;
    assignmentConfirmed: boolean;
    assignmentShared?: boolean;
    assignmentComment?: string;
    mailTokens?: { exhibitor?: string };
    status: OrderStatus;
    blocked?: boolean;
};

export enum OrderStatus {
    DELETED = "Deleted",
    DRAFT = "Draft",
    REFUSED = "Refused",
    SUBMITTED = "Submitted",
    VALIDATED = "Validated",
    CANCELLED = "Cancelled",
}

export type SerializedOrder = {
    id: string;
    userInfo: any;
    submissionDate: number;
    validationDate: number | null;
    contracts: Contract[];
    event: string;
    author?: string;
    username?: string | null;
    mailTokens: any;
    walletStatus: string | null;
    orgId: string | null;
    personId: string | null;
    billFiles: BillFile[];
    owner: string | null;
    billRequestStatus?: string;
    conversationEmail?: string;
    installments: Installment[];
    archived?: boolean;
    favorite?: string;
    assignmentConfirmed?: boolean;
    assignmentShared?: boolean;
    assignmentComment?: string;
};
