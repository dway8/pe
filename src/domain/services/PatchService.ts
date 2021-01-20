import { Action } from "@domain/entities/Action";
import * as commonUtils from "@domain/commonUtils";
import { Order } from "@domain/entities/Order";
import { Patch } from "@domain/entities/Patch";
import { IDiffService } from "@interfaces/IDiffService";
import { ILoggerService } from "@interfaces/ILoggerService";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";

export class PatchService {
    Repository: IOrderRepository;
    DiffService: IDiffService;
    LoggerService: ILoggerService;

    constructor(
        Repository: IOrderRepository,
        DiffService: IDiffService,
        LoggerService: ILoggerService
    ) {
        this.Repository = Repository;
        this.DiffService = DiffService;
        this.LoggerService = LoggerService;
    }

    async computePatchForOrder(
        event: string,
        oldOrder: Order,
        newOrder: Order,
        role: string,
        action: Action,
        username: string | null,
        objectToBeMerged: any = null
    ): Promise<Patch | null> {
        let patch;
        const diff = this.DiffService.diff(oldOrder, newOrder);

        if (diff || action === Action.AUTO_SENT_PAYMENT_RECALL) {
            this.LoggerService.verbose(
                `Creating patch for order ${newOrder.id} and action ${action}`
            );
            let patchObj = {
                date: new Date().getTime(),
                action,
                role,
                orderId: newOrder.id,
                diff,
                username,
            };

            if (objectToBeMerged) {
                patchObj = { ...patchObj, ...objectToBeMerged };
            }

            patch = await this.Repository.createPatch(event, patchObj);
        } else {
            this.LoggerService.verbose(
                `No diff, not creating patch for order ${oldOrder.id} and action ${action}`
            );
        }

        return patch;
    }

    formatPatch(origPatch: Patch) {
        const patch = commonUtils.copyDeep(origPatch);
        patch.lastMessage = this.findLastMessage(patch.diff);
        if (
            ![
                Action.ADMIN_EDITED,
                Action.EXHIBITOR_SUBMITTED_CHANGES,
                Action.ADMIN_SET_PUBLISHED,
            ].includes(patch.action)
        ) {
            patch.diff = [];
        } else {
            patch.diff = this.formatDiff(patch.diff);
        }
        return patch;
    }

    private findLastMessage(diff) {
        return diff && diff.lastMessage
            ? diff.lastMessage[diff.lastMessage.length - 1]
            : null;
    }

    private formatDiff(diff) {
        const changedKeys = Object.keys(diff).reduce(
            (acc: string[], key: string): string[] => {
                const list = ["userInfo", "standForm", "optionForm", "files"];
                if (list.includes(key)) {
                    acc = acc.concat(Object.keys(diff[key]));
                } else if ("rebate" === key) {
                    // handle old diffs with rebate key instead of rebates
                    if (diff[key].length > 1 || diff[key][0] !== 0) {
                        acc = acc.concat(["rebate"]);
                    }
                } else if ("rebates" === key) {
                    if (
                        (diff[key] || []).length > 1 ||
                        (diff[key] || []) !== 0
                    ) {
                        acc = acc.concat(["rebates"]);
                    }
                } else if ("additionalOptions" === key) {
                    if (diff[key].length > 1 || diff[key][0] !== 0) {
                        acc = acc.concat(["additionalOptions"]);
                    }
                } else if ("published" === key) {
                    acc = acc.concat(
                        diff["published"].map((b) => b.toString())
                    );
                }
                return acc;
            },
            []
        );
        return changedKeys;
    }

    public async getSubmissionPatchForOrder(
        event: string,
        orderId: string
    ): Promise<Patch | null> {
        const patch = await this.Repository.findPatchBy(event, {
            orderId: orderId,
            action: Action.INITIAL_FORM_SUBMISSION,
        });
        return patch;
    }

    public async getValidationPatchForOrder(
        event: string,
        orderId: string
    ): Promise<Patch | null> {
        const patch = await this.Repository.findPatchBy(event, {
            orderId: orderId,
            action: Action.ADMIN_VALIDATED,
        });
        return patch;
    }
}
