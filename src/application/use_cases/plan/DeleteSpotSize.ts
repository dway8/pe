import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";
import { Plan } from "@domain/entities/Plan";

export const DeleteSpotSize = (PlanRepository: IPlanRepository) => {
    async function Execute(event: string, newSpotSizes): Promise<Plan> {
        return PlanRepository.replaceSpotSizes(event, newSpotSizes);
    }

    return { Execute };
};
