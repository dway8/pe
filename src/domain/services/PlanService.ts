import { SpotSize } from "@domain/entities/Plan";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";

export class PlanService {
    PlanRepository: IPlanRepository;

    constructor(PlanRepository: IPlanRepository) {
        this.PlanRepository = PlanRepository;
    }

    async doesSpotSizeExist(
        event: string,
        spotSize: SpotSize
    ): Promise<boolean> {
        const plan = await this.PlanRepository.get(event);
        return plan.spotSizes.reduce(
            (acc: boolean, existingSpotSize: SpotSize) => {
                acc =
                    acc ||
                    (existingSpotSize.width === spotSize.width &&
                        existingSpotSize.height === spotSize.height);
                return acc;
            },
            false
        );
    }
}
