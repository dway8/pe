import express from "express";

import { PlanController } from "@controllers/PlanController";
import { ProjectDependencies } from "@config/projectDependencies";

const planRouter = (dependencies: ProjectDependencies) => {
    const router = express.Router({ mergeParams: true });

    const controller = new PlanController(dependencies);

    router.route("/").get(controller.getPlan).post(controller.saveInitialPlan);
    router.post("/shape", controller.addShape);
    router.post("/spot-size", controller.addSpotSize);
    router.post("/spot-sizes/delete", controller.deleteSpotSize);
    router.post("/shapes/delete", controller.deleteShapes);
    router.post("/opacity", controller.updateOpacity);
    router.post("/shapes/coordinates", controller.updateShapesCoordinates);
    router.post("/shapes/sector", controller.updateShapesSector);

    return router;
};

export default planRouter;
