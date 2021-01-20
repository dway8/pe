import { Order, SerializedOrder } from "@domain/entities/Order";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";
import { PatchService } from "./PatchService";
import * as commonUtils from "@domain/commonUtils";
import { IPersonRepository } from "@interfaces/persistence/IPersonRepository";
import { IOrgRepository } from "@interfaces/persistence/IOrgRepository";
import { BillRequestStatus } from "@domain/entities/Bill";

export enum SerializeFlag {
    SERIALIZE_MINIMAL,
    SERIALIZE_PLAN,
    SERIALIZE_PUBLIC,
}

export class OrderSerializerService {
    OrderRepository: IOrderRepository;
    PatchService: PatchService;
    PlanRepository: IPlanRepository;
    PersonRepository: IPersonRepository;
    OrgRepository: IOrgRepository;

    constructor(
        OrderRepository: IOrderRepository,
        PatchService: PatchService,
        PlanRepository: IPlanRepository
    ) {
        this.OrderRepository = OrderRepository;
        this.PatchService = PatchService;
        this.PlanRepository = PlanRepository;
    }

    async serializeOrder(
        event: string,
        o: Order,
        flag?: SerializeFlag,
        orderIdToOrgId?: Record<string, string>,
        orderIdToPersonId?: Record<string, string>
    ): Promise<SerializedOrder> {
        const order = commonUtils.copyDeep(o) as SerializedOrder;
        order.event = event;

        if (flag === SerializeFlag.SERIALIZE_MINIMAL) {
            order.submissionDate = 0;
            order.contracts = [];
            order.orgId = "";
            return order;
        }

        if (flag !== SerializeFlag.SERIALIZE_PUBLIC) {
            await this.addSpotsLabelsToOrder(event, order);
        }

        if (flag === SerializeFlag.SERIALIZE_PLAN) {
            order.submissionDate = 0;
            order.contracts = [];
            order.orgId = "";
            return order;
        }

        const wallet = await this.OrderRepository.getWalletForOrder(
            event,
            order.id
        );
        order.walletStatus = wallet ? wallet.status : null;

        order.contracts = await this.OrderRepository.getContractsForOrder(
            event,
            order.id
        );

        if (!order.author && !order.username) {
            const submissionPatch = await this.PatchService.getSubmissionPatchForOrder(
                event,
                order.id
            );
            if (submissionPatch) {
                order.author = submissionPatch.role;
                order.username = submissionPatch.username;
            }
        }

        // TODO
        // if (order.mailTokens) {
        //     if (this.services.mailService && order.mailTokens.exhibitor) {
        //         order.conversationEmail = this.services.mailService.planexpoDiscussionEmail(
        //             order.mailTokens.exhibitor
        //         );
        //     }
        //     delete order.mailTokens;
        // }

        const validationPatch = await this.PatchService.getValidationPatchForOrder(
            event,
            order.id
        );
        order.validationDate = validationPatch ? validationPatch.date : null;

        order.personId = orderIdToPersonId
            ? orderIdToPersonId[order.id] || null
            : await this.PersonRepository.getPersonIdForOrder(order.id);
        order.orgId = orderIdToOrgId
            ? orderIdToOrgId[order.id] || null
            : await this.OrgRepository.getOrgIdForOrder(order.id);

        const billFiles = await this.OrderRepository.getBillsForOrder(
            event,
            order.id
        );

        billFiles.forEach((bf) => {
            if (bf.bill) {
                bf.generated = true;
                delete bf.bill;
            }
        });
        order.billFiles = billFiles;

        order.installments = await this.OrderRepository.getInstallmentsForOrder(
            event,
            order.id
        );

        if (flag === SerializeFlag.SERIALIZE_PUBLIC) {
            delete order.archived;
            order.owner = null;
            order.billFiles.forEach((bf) => delete bf.comment);
            delete order.favorite;
            delete order.assignmentConfirmed;
            delete order.assignmentComment;
            if (order.assignmentShared) {
                await this.addSpotsLabelsToOrder(event, order);
            }
        } else {
            const pendingBillRequests = await this.OrderRepository.getPendingBillRequestsForOrder(
                event,

                order.id
            );
            order.billRequestStatus =
                pendingBillRequests.length > 0
                    ? BillRequestStatus.BILL_REQUESTED
                    : BillRequestStatus.BILL_NOT_REQUESTED;
        }

        return order;
    }

    private async addSpotsLabelsToOrder(event: string, order): Promise<void> {
        const spotIdsAndLabels = {};
        for (const spotId of order.spotIds) {
            const spot = await this.PlanRepository.getShape(event, spotId);
            spotIdsAndLabels[spotId] = spot
                ? `${spot.sectorName || ""}${spot.sectorIndex || ""}`
                : "";
        }
        order.spotIdsAndLabels = spotIdsAndLabels;
        delete order.spotIds;
    }
}
