import { PlanService } from "@domain/services/PlanService";
import { ILoggerService } from "@interfaces/ILoggerService";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";

export const AddSpotSize = (
    PlanRepository: IPlanRepository,
    LoggerService: ILoggerService,
    PlanService: PlanService
) => {
    async function Execute(event: string, spotSize) {
        const doesSpotSizeExist = await PlanService.doesSpotSizeExist(
            event,
            spotSize
        );

        if (!doesSpotSizeExist) {
            LoggerService.verbose("Adding new spot size in plan", spotSize);
            PlanRepository.addSpotSize(event, spotSize);
        } else {
            LoggerService.verbose(
                `Spot size ${spotSize} already exists, not adding it`
            );
        }
    }

    return { Execute };
};
