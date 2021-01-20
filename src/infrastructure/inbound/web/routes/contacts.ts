import express from "express";
import { ContactsController } from "@controllers/ContactsController";
import { ProjectDependencies } from "@config/projectDependencies";

const contactsRouter = (dependencies: ProjectDependencies) => {
    const router = express.Router({ mergeParams: true });

    const controller = new ContactsController(dependencies);

    // ACTIVITIES
    router
        .route("/activities")
        .get(controller.getAllActivities)
        .post(controller.createOrUpdateActivity);

    // PERSONS
    router.get("/persons", controller.getAllPersons);
    router.post("/persons/sync", controller.synchronizePerson);
    router
        .route("/persons/:id")
        .post(controller.createOrUpdatePerson)
        .delete(controller.deletePerson);
    router.post("/persons/owner/:id", controller.updatePersonOwner);

    // ORGS
    router.get("/orgs", controller.getAllOrgs);
    router
        .route("/orgs/:id")
        .get(controller.getOrg)
        .post(controller.createOrUpdateOrg)
        .delete(controller.deleteOrg);
    router.post("/orgs/sync", controller.synchronizeOrg);
    router.post("/orgs/owner/:id", controller.updateOrgOwner);
    router.post("/orgs/:id/favorite", controller.updateOrgFavoriteLevel);

    // EXPORT
    router.post("/export/:format", controller.generateContactsExport);
    router.get("/export/:uid", controller.downloadContactsExport);

    return router;
};

export default contactsRouter;
