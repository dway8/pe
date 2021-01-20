import { ProjectDependencies } from "@config/projectDependencies";
import plan from "./plan";
import contacts from "./contacts";

const {
    requireAuthentication,
} = require("@infrastructure/inbound/web/middlewares/auth");

export default (dependencies: ProjectDependencies, app) => {
    const requireAuthMiddleware = requireAuthentication(
        dependencies.AuthenticationService,
        dependencies.CustomerOptions.customer.customerName
    );

    app.use("/api/admin", requireAuthMiddleware);
    app.use("/:event/api/admin/plan", plan(dependencies));
    app.use("/api/admin/contacts", contacts(dependencies));
};
