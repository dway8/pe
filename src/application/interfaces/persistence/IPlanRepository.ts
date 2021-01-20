import { Plan, Floor, SpotSize, Shape } from "@domain/entities/Plan";

export interface IPlanRepository {
    get(event: string): Promise<Plan>;

    update(event: string, params: Record<string, unknown>): Promise<Plan>;

    getFloor(event: string, floorId: string): Promise<Floor | null>;

    updateFloor(event: string, floorId: string, floor: Floor): Promise<Plan>;

    addSpotSize(event: string, spotSize: SpotSize): Promise<Plan>;

    replaceSpotSizes(event: string, newSpotSizes: SpotSize[]): Promise<Plan>;

    deleteShapes(event: string, floor: Floor, ids: string[]): Promise<Plan>;

    updateOpacity(
        event: string,
        floorId: string,
        opacity: number
    ): Promise<void>;

    updateShape(event: string, floorId: string, shape: Shape): Promise<void>;

    getShape(event: string, id: string): Promise<Shape | null>;
}
