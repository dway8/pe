import { ILoggerService } from "@interfaces/ILoggerService";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";

export const DeleteShapes = (
    PlanRepository: IPlanRepository,
    LoggerService: ILoggerService
) => {
    async function Execute(event: string, floorId: string, ids: string[]) {
        if (!ids) {
            throw new Error("No ids given");
        }

        LoggerService.verbose("Deleting following shapes in plan", ids);

        const floor = await PlanRepository.getFloor(event, floorId);

        if (!floor) {
            throw new Error(`No floor found for id ${floorId}`);
        }

        if (!floor.shapes) {
            throw new Error(
                `Request to delete shapes but no shapes found in floor ${floorId}`
            );
        }

        PlanRepository.deleteShapes(event, floor, ids);
    }

    return { Execute };
};
