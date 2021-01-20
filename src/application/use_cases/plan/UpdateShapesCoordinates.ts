import { ILoggerService } from "@interfaces/ILoggerService";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";

export const UpdateShapesCoordinates = (
    PlanRepository: IPlanRepository,
    LoggerService: ILoggerService
) => {
    async function Execute(
        event: string,
        floorId: string,
        modifiedShapes: any
    ): Promise<void> {
        if (!modifiedShapes) {
            throw new Error("No movedShapes given");
        }

        if (!Array.isArray(modifiedShapes)) {
            throw new Error("The modifiedShapes param should be an array");
        }

        LoggerService.verbose(
            "Saving shapes coordinates on plan",
            modifiedShapes
        );

        const floor = await PlanRepository.getFloor(event, floorId);

        if (!floor) {
            throw new Error(`No floor found for id ${floorId}`);
        }

        if (!floor.shapes) {
            throw new Error(
                `Request to save shapes coordinates but no shapes found in floor ${floorId}`
            );
        }

        for (let i = 0; i < modifiedShapes.length; i++) {
            const modifiedShape = modifiedShapes[i];

            if (!modifiedShape.id) {
                throw new Error("The given shapes should have ids");
            }

            if (!floor.shapes[modifiedShape.id]) {
                throw new Error(
                    `Shape not found for id ${modifiedShape.id} in floor ${floorId}`
                );
            }

            await PlanRepository.updateShape(event, floorId, modifiedShape);
        }
    }

    return { Execute };
};
