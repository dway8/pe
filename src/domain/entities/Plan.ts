export type Floor = { shapes: Record<string, Shape>; plan: FloorPlan };

type FloorPlan = { href?: string };

export type SpotSize = { width: number; height: number };

export type Plan = {
    floors: Record<string, Floor>;
    spotSizes: SpotSize[];
};

export type Shape = { id: string; sectorName?: string; sectorIndex?: string };
