import { ILoggerService } from "@interfaces/ILoggerService";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";

export const UpdateOpacity = (
    PlanRepository: IPlanRepository,
    LoggerService: ILoggerService
) => {
    async function Execute(
        event: string,
        floorId: string,
        opacity: number
    ): Promise<void> {
        if (typeof opacity !== "number") {
            throw new Error("No opacity given");
        }
        if (opacity < 0 || opacity > 1) {
            throw new Error(
                `The opacity should be between 0 and 1 but ${opacity} given`
            );
        }

        LoggerService.verbose("Saving plan opacity", { floorId, opacity });

        PlanRepository.updateOpacity(event, floorId, opacity);
    }

    return { Execute };
};
