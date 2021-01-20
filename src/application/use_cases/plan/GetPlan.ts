import { Plan } from "@domain/entities/Plan";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";

export const GetPlan = (PlanRepository: IPlanRepository) => {
    async function Execute(event: string): Promise<Plan> {
        const plan = await PlanRepository.get(event);

        return plan;
    }

    return { Execute };
};
