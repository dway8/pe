import express from "express";
import { ProjectDependencies } from "@config/projectDependencies";
import { AdminOrdersController } from "@controllers/AdminOrdersController";

const contactsRouter = (dependencies: ProjectDependencies) => {
    const router = express.Router({ mergeParams: true });

    const controller = new AdminOrdersController(dependencies);

    // router.get("/bill_requests") TODO should go elsewhere?

    router.get("/all", controller.getAllOrders);
    router.post("/favorite", controller.updateOrderFavoriteLevel);
    // router.post("/publish", controller.updateOrderPublicationStatus);
    // router.post("/changeStatus", controller.updateOrderStatus);

    // router.post("/export/:format", controller.generateOrdersExport);
    // router.get("/export/:uid", controller.downloadOrdersExport);

    // router.post("/installments/:id", controller.updateOrderInstallments);

    // router.post("/contract/:id", controller.signInitialContract);
    // router.post("/amendment/:id", controller.acceptOrRefuseAmendment);
    // router.post("/cancel_contract/:id", controller.cancelContract);

    // router.get("/history/:id", controller.getOrderHistory);
    // router.get("/contacts/:id", controller.updateOrderContacts);
    // router.get("/message/:id", controller.sendMessage);
    // router.get("/readInbox/:id", controller.markInboxAsRead);
    // router.post("/spot/:id", controller.assignSpotToOrder);
    // router.post("/spot/unassign/:id", controller.unassignSpotFromOrder);
    // router.post("/assignmentComment/:id", controller.updateAssignmentComment);
    // router.post(
    //     "/assignmentSharing/:id",
    //     controller.updateAssignmentSharingStatus
    // );
    // router.post("/uploadFile/:id", controller.uploadFileForOrder);

    // router.route("/:id").get(controller.getOrder).post(controller.updateOrder);

    // router
    //     .route("/bills/:id")
    //     .post(controller.createOrUpdateBill)
    //     .delete(controller.deleteBill);

    // router.post("/owner/:id", controller.updateOrderOwner);

    // router.get("/request_bill/:id", controller.requestBill);
    // router.get("/bills/mark_as_paid/:id", controller.markBillAsPaid);

    return router;
};

export default contactsRouter;
