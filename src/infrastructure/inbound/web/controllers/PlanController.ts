import { GetPlan } from "@use_cases/plan/GetPlan";
import { SaveInitialPlan } from "@use_cases/plan/SaveInitialPlan";
import { AddShape } from "@use_cases/plan/AddShape";
import { AddSpotSize } from "@use_cases/plan/AddSpotSize";
import { DeleteSpotSize } from "@use_cases/plan/DeleteSpotSize";
import { DeleteShapes } from "@use_cases/plan/DeleteShapes";
import { UpdateOpacity } from "@use_cases/plan/UpdateOpacity";
import { UpdateShapesCoordinates } from "@use_cases/plan/UpdateShapesCoordinates";
import { AssignSectorToSpots } from "@use_cases/plan/AssignSectorToSpots";
import { IPlanRepository } from "@interfaces/persistence/IPlanRepository";
import { IStorageService } from "@interfaces/IStorageService";
import { PlanService } from "@domain/services/PlanService";

export class PlanController {
    LoggerService: any;
    PlanRepository: IPlanRepository;
    StorageService: IStorageService;
    PlanService: PlanService;

    constructor(dependencies) {
        this.LoggerService = dependencies.LoggerService;
        this.StorageService = dependencies.StorageService;
        this.PlanRepository = dependencies.DatabaseService.PlanRepository;
        this.PlanService = dependencies.PlanService;
    }

    getPlan = (req, res, next) => {
        // init use case
        const GetPlanCommand = GetPlan(this.PlanRepository);

        const { event } = req.params;
        // call use case
        GetPlanCommand.Execute(event).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    saveInitialPlan = (req, res, next) => {
        const SaveInitialPlanCommand = SaveInitialPlan(
            this.PlanRepository,
            this.StorageService
        );

        const { floorsData } = req.body;
        const { event } = req.params;
        SaveInitialPlanCommand.Execute(event, floorsData).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    addShape = (req, res, next) => {
        const AddShapeCommand = AddShape(this.PlanRepository);

        const { shape, floorId } = req.body;
        const { event } = req.params;
        AddShapeCommand.Execute(event, floorId, shape).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    addSpotSize = (req, res, next) => {
        const AddSpotSizeCommand = AddSpotSize(
            this.PlanRepository,
            this.LoggerService,
            this.PlanService
        );

        const { spotSize } = req.body;
        const { event } = req.params;
        AddSpotSizeCommand.Execute(event, spotSize).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    deleteSpotSize = (req, res, next) => {
        const DeleteSpotSizeCommand = DeleteSpotSize(this.PlanRepository);

        const { newSpotSizes } = req.body;
        const { event } = req.params;
        DeleteSpotSizeCommand.Execute(event, newSpotSizes).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    deleteShapes = (req, res, next) => {
        const DeleteShapesCommand = DeleteShapes(
            this.PlanRepository,
            this.LoggerService
        );

        const { ids, floorId } = req.body;
        const { event } = req.params;
        DeleteShapesCommand.Execute(event, floorId, ids).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    updateOpacity = (req, res, next) => {
        const UpdateOpacityCommand = UpdateOpacity(
            this.PlanRepository,
            this.LoggerService
        );

        const { opacity, floorId } = req.body;
        const { event } = req.params;
        UpdateOpacityCommand.Execute(event, floorId, opacity).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    updateShapesCoordinates = (req, res, next) => {
        const UpdateShapesCoordinatesCommand = UpdateShapesCoordinates(
            this.PlanRepository,
            this.LoggerService
        );

        const { shapes, floorId } = req.body;
        const { event } = req.params;
        UpdateShapesCoordinatesCommand.Execute(event, floorId, shapes).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    updateShapesSector = (req, res, next) => {
        const UpdateShapesSectorCommand = AssignSectorToSpots(
            this.PlanRepository,
            this.LoggerService
        );

        const { ids, sectorName, sectorIndex, floorId } = req.body;
        const { event } = req.params;
        UpdateShapesSectorCommand.Execute(
            event,
            floorId,
            ids,
            sectorName,
            sectorIndex
        ).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };
}
