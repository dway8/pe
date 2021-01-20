import * as commonUtils from "@domain/commonUtils";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";
import { IStorageService } from "@interfaces/IStorageService";

export const SaveInitialPlan = (
    PlanRepository: IPlanRepository,
    StorageService: IStorageService
) => {
    async function Execute(event: string, floorsData: any) {
        if (!floorsData) {
            throw new Error("The input should not be null");
        }
        if (!Array.isArray(floorsData)) {
            throw new Error("The input should be an array");
        }

        const floors = {};

        for (const floor of floorsData) {
            if (!floor.id) {
                throw new Error("The floors received should have ids");
            }

            const base64 = floor.plan.href;

            const type = base64.substring(
                base64.indexOf(":") + 1,
                base64.indexOf(";base64")
            );
            const data = base64.split("base64,")[1];
            const filename = floor.id + commonUtils.filetypeToExtension(type);
            await StorageService.storePlanBackground(event, data, filename);

            floor.plan.filename = filename;
            floor.plan.version = 1;
            delete floor.plan.href;

            floors[floor.id] = floor;
        }

        const plan = await PlanRepository.update(event, floors);

        return plan;
    }

    return { Execute };
};
