import { Plan } from "@domain/entities/Plan";
import { ILoggerService } from "@interfaces/ILoggerService";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";

export const AssignSectorToSpots = (
    PlanRepository: IPlanRepository,
    LoggerService: ILoggerService
) => {
    async function Execute(
        event: string,
        floorId: string,
        ids: string[],
        sectorName: string,
        sectorIndex: string
    ): Promise<Plan> {
        if (!ids) {
            throw new Error("No ids given");
        }
        if (!sectorName && !sectorIndex) {
            throw new Error("No sectorName and no sectorIndex given");
        }

        LoggerService.verbose("Saving shapes sector on plan for ids", { ids });

        const floor = await PlanRepository.getFloor(event, floorId);

        if (!floor) {
            throw new Error(`No floor found for id ${floorId}`);
        }

        if (!floor.shapes) {
            throw new Error(
                `Request to assign sector to spots but no shapes found in floor ${floorId}`
            );
        }

        for (const id in ids) {
            const shape = floor.shapes[id];
            if (!shape) {
                throw new Error(
                    `Shape not found for id ${id} in floor ${floorId}`
                );
            }

            shape.sectorName = sectorName;
            shape.sectorIndex = sectorIndex;

            await PlanRepository.updateShape(event, floorId, shape);
        }

        const plan = await PlanRepository.get(event);
        return plan;
    }

    return { Execute };
};
