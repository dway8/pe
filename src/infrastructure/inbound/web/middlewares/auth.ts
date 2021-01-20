import { AuthenticationService } from "@domain/services/AuthenticationService";
import { ILoggerService } from "@interfaces/ILoggerService";

const auth = require("basic-auth");
const bcrypt = require("bcrypt");

function asyncWrapper(target) {
    return function asyncWrapperMiddleware(req, res, next) {
        target(req, res, next).catch(next);
    };
}

function requireAuthentication(
    AuthenticationService: AuthenticationService,
    LoggerService: ILoggerService,
    realm: string
) {
    return asyncWrapper(async function requireAuthenticationMiddleware(
        req,
        res,
        next
    ) {
        function failed() {
            res.set("WWW-Authenticate", `Basic realm="${realm}"`);
            res.status(401);
            res.send("Authorization required.");
        }

        let credentials = auth(req);
        if (!credentials) {
            LoggerService.verbose(
                "requireAuth: No credentials found in request."
            );
            return failed();
        }

        const user = await AuthenticationService.getUserFromUsername(
            credentials.name
        );
        if (!user) {
            LoggerService.info(
                `Login attempt: User "${credentials.name}" not found inside database.`
            );
            return failed();
        }

        if (user.disabled) {
            LoggerService.info(
                `Login attempt: User "${credentials.name}" is disabled.`
            );
            return failed();
        }

        const hash = await AuthenticationService.getUserPasswordFromUsername(
            credentials.name
        );
        if (!hash) {
            LoggerService.error(
                `requireAuth: User "${credentials.name}" doesn't have a password registered in database.`
            );
            return failed();
        }

        if (!(await bcrypt.compare(credentials.pass, hash))) {
            LoggerService.info(
                `Loggin attempt: "User ${credentials.name}" password is invalid.`
            );
            return failed();
        }

        LoggerService.verbose(
            `User "${credentials.name}" successfully logged in.`
        );
        req.user = user;
        return next();
    });
}

function requireSuperadmin(LoggerService: ILoggerService, realm: string) {
    return asyncWrapper(async function requireAuthenticationMiddleware(
        req,
        res,
        next
    ) {
        function failed() {
            res.set("WWW-Authenticate", `Basic realm="${realm}"`);
            res.status(401);
            res.send("Superadmin authorization required.");
        }

        let credentials = auth(req);
        if (!credentials) {
            LoggerService.verbose(
                "requireSuperadminAuth: No credentials found in request."
            );
            return failed();
        }
        if (credentials.name !== "spottt") {
            LoggerService.verbose(
                "requireSuperadminAuth: No superadmin credentials found in request."
            );
            return failed();
        }

        LoggerService.verbose(
            `Superadmin user "${credentials.name}" successfully logged in.`
        );
        return next();
    });
}

function noAuthentication() {
    return function noAuthenticationMiddleware(req, res, next) {
        req.user = null;
        return next();
    };
}

module.exports = {
    requireAuthentication,
    noAuthentication,
    requireSuperadmin,
};
