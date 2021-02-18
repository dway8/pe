import { ProjectDependencies } from "@config/projectDependencies";
import { OrderSerializerService } from "@domain/services/OrderSerializerService";
import { PatchService } from "@domain/services/PatchService";
import { IOrderRepository } from "@interfaces/persistence/IOrderRepository";
import { GetAllOrders } from "@use_cases/orders/GetAllOrders";
import { UpdateOrderFavoriteLevel } from "@use_cases/orders/UpdateOrderFavoriteLevel";
import { UpdateOrderPublicationStatus } from "@use_cases/orders/UpdateOrderPublicationStatus";
import { getUsernameFromReq } from "./utils";

export class AdminOrdersController {
    OrderRepository: IOrderRepository;
    OrderSerializerService: OrderSerializerService;
    PatchService: PatchService;

    constructor(dependencies: ProjectDependencies) {
        this.OrderRepository = dependencies.DatabaseService.OrderRepository;
        this.PatchService = dependencies.PatchService;
    }

    getAllOrders = (req, res, next) => {
        const GetAllOrdersCommand = GetAllOrders(
            this.OrderRepository,
            this.OrderSerializerService
        );

        const { event } = req.params;

        GetAllOrdersCommand.Execute(event).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    updateOrderFavoriteLevel = (req, res, next) => {
        const UpdateOrderFavoriteLevelCommand = UpdateOrderFavoriteLevel(
            this.OrderRepository,
            this.OrderSerializerService,
            this.PatchService
        );

        const { event } = req.params;
        const { id, favorite } = req.body;
        const username = getUsernameFromReq(req);

        UpdateOrderFavoriteLevelCommand.Execute(
            event,
            id,
            favorite,
            username
        ).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    updateOrderPublicationStatus = (req, res, next) => {
        const UpdateOrderPublicationStatusCommand = UpdateOrderPublicationStatus(
            this.OrderRepository,
            this.OrderSerializerService
        );

        const { event } = req.params;
        const { id, published } = req.body;

        UpdateOrderPublicationStatusCommand.Execute(event, id, published).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };

    updateOrderStatus = (req, res, next) => {
        const UpdateOrderStatusCommand = UpdateOrderPublicationStatus(
            this.OrderRepository,
            this.OrderSerializerService
        );

        const { event } = req.params;
        const { id, published } = req.body;

        UpdateOrderStatusCommand.Execute(event, id, published).then(
            (response) => {
                res.json({ success: true, data: response });
            },
            (err) => {
                next(err);
            }
        );
    };
}
