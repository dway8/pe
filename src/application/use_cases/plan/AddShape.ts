import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";

export const AddShape = (PlanRepository: IPlanRepository) => {
    async function Execute(event: string, floorId: string, shape) {
        if (!shape) {
            throw new Error("No shape given");
        }
        if (!shape.id) {
            throw new Error("No id in given shape");
        }

        const floor = await PlanRepository.getFloor(event, floorId);
        if (!floor) {
            throw new Error(`No floor found for id ${floorId}`);
        }

        if (!floor.shapes) {
            floor.shapes = {};
        }
        floor.shapes[shape.id] = shape;

        const plan = await PlanRepository.updateFloor(event, floorId, floor);

        return plan;
    }

    return { Execute };
};
