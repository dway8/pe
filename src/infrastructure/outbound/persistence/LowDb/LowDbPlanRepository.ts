const _ = require("lodash");

import { Plan, Floor, Shape } from "@domain/entities/Plan";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";

export class LowDbPlanRepository implements IPlanRepository {
    eventDbs: any[];

    constructor(eventDbs) {
        this.eventDbs = eventDbs;
    }

    getPlanDb(event: string) {
        return this.eventDbs[event].get("plan");
    }

    async get(event: string): Promise<Plan> {
        const db = this.eventDbs[event];

        if (!db.has("plan").value()) {
            db.set("plan", { spotSizes: [], floors: {}, labels: [] }).write();
        }

        const plan: Plan = _.cloneDeep(this.getPlanDb(event).value());
        Object.values(plan.floors).forEach((floor) => {
            delete floor.plan.href;
        });
        return plan;
    }

    async update(event: string, params: Record<string, unknown>) {
        return this.getPlanDb(event).assign(params).write();
    }

    async getFloor(event: string, floorId: string) {
        return this.getPlanDb(event).value().floors[floorId];
    }

    async updateFloor(
        event: string,
        floorId: string,
        floor: Floor
    ): Promise<Plan> {
        const plan = await this.get(event);
        const floors = plan.floors;
        floors[floorId] = floor;
        return this.update(event, {
            floors,
        });
    }

    async addSpotSize(event: string, spotSize) {
        const plan = await this.get(event);
        return this.update(event, {
            spotSizes: plan.spotSizes.concat([spotSize]),
        });
    }

    async replaceSpotSizes(event: string, newSpotSizes) {
        return this.update(event, {
            spotSizes: newSpotSizes,
        });
    }

    async deleteShapes(event: string, floor, ids: string[]) {
        ids.map((id) => delete floor.shapes[id]);
        return this.updateFloor(event, floor.id, floor);
    }

    async updateOpacity(event: string, floorId: string, opacity: number) {
        const floor = await this.getFloor(event, floorId);
        floor.plan.opacity = opacity;
        await this.updateFloor(event, floorId, floor);
    }

    async updateShape(event: string, floorId: string, shape: Shape) {
        const floor = await this.getFloor(event, floorId);
        floor.shapes[shape.id] = shape;
        await this.updateFloor(event, floorId, floor);
    }

    async getShape(event: string, id: string): Promise<Shape | null> {
        const plan = await this.get(event);
        const floors = plan.floors || {};

        return Object.keys(floors).reduce(
            (acc: Shape | null, floorId: string): Shape | null => {
                if (!acc) {
                    const floor = floors[floorId];
                    const shapes = floor.shapes;
                    return shapes[id];
                }
                return acc;
            },
            null
        );
    }
}
