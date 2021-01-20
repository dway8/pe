import "module-alias/register";
const http = require("http");
const express = require("express");
const exphbs = require("express-handlebars");
const cors = require("cors");
import config from "./config/config.js";
const bodyParser = require("body-parser");

import logger from "@infrastructure/outbound/logging/logger"; //TODO
import mountRoutes from "@infrastructure/inbound/web/routes";
import { ProjectDependencies } from "./config/projectDependencies";
import ErrorHandler from "@infrastructure/inbound/web/middlewares/ErrorHandler";

// Constants

const PORT = 8080;
const whitelist = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://admin.planexpo.fr",
    "https://crm.planexpo-test.ovh",
    "https://crm.planexpo-test.ovh:8443",
    "http://crm.planexpo.fr",
    "https://crm.planexpo.fr",
    "https://salondu2roues.jaocreation.fr",
    "https://www.salondu2roues.com",
];
const corsOptions = {
    origin: function (origin, callback) {
        const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    credentials: true,
};
// rendering engine
const hbs = exphbs.create({
    extname: ".handlebars",
    defaultView: "default",
    layoutsDir: config.templatePath + "/layouts/",
    partialsDir: config.templatePath + "/partials/",
    // Specify helpers which are only registered on this instance.
    helpers: {
        formatDate: function (timestamp) {
            const options = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            };
            return new Intl.DateTimeFormat("fr-FR", options).format(
                new Date(timestamp)
            );
        },
        toEuros: function (cents) {
            if (isNaN(cents)) {
                return cents;
            }
            return (cents / 100).toFixed(2).replace(".", ",");
        },
        toJson: function (obj) {
            return JSON.stringify(obj, undefined, 4);
        },
    },
});

const app = express();

let options;
const configPath = config.optionFilePath;
try {
    options = require(configPath);
} catch (e) {
    console.error(
        "Could not read customer option configuration. Set configPath correctly: " +
            configPath
    );
    process.exit(1);
}

const adminDir = `${config.rootDirectory}/admin`;
const projectDependencies = new ProjectDependencies(options, adminDir);

app.engine("handlebars", hbs.engine);
app.set("views", config.templatePath);
app.set("view engine", "handlebars");

// options
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.set("x-powered-by", false);

// load routes

mountRoutes(projectDependencies, app);

// generic error handler
app.use(() => ErrorHandler(projectDependencies.LoggerService));

const server = http.createServer(app);
server.on("listening", function () {
    console.log(`Listening on port ${PORT}.`);
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: "100mb" }));

// parse application/json
app.use(bodyParser.json({ limit: "100mb" }));

// parse any other request
app.use(bodyParser.raw({ type: (_req) => true, limit: "100mb" }));

app.use((err, req, res, next) => {
    if (err.type === "request.aborted") {
        console.log(
            "Caught an error when a request got cancelled while bodyparser was doing its thing",
            { err }
        );
        return res.end();
    } else {
        next(err);
    }
});

app.use(logger.morgan.request, logger.morgan.response);

const finalErrorHandler = (err, req, res, _next) => {
    console.error("An error was caught by the final error handler!", {
        err,
    });
    res.status(500);
    res.send("Something went wrong!");
};

app.use(finalErrorHandler);

if (process.env.AIO_WRAPPED) {
    // module.exports = { app, requireAuth };
    module.exports = { app };
} else {
    server.listen(PORT);
}

process.on("SIGINT", () => {
    console.log("Bye bye!");
    process.exit();
});
