const util = require("util");
const winston = require("winston");
const { LEVEL, MESSAGE, SPLAT } = require("triple-beam");
require("winston-daily-rotate-file");

require("./logger-transport-slack.js");

let isDev = process.env.CONTEXT !== "PROD" && process.env.CONTEXT !== "PREPROD";

let meta = {
    customer: process.env.CUSTOMER,
    context: process.env.CONTEXT,
};

let default_output_format = winston.format.printf((msg) => {
    let output = `[${meta.customer}/${meta.context}]\t[${
        msg.timestamp
    }]\t${msg.level.toUpperCase()}\t${msg.message}`;

    let rest = { ...msg };
    delete rest.timestamp;
    delete rest.level;
    delete rest.message;
    if (Object.keys(rest).length > 0) {
        output += ` ${JSON.stringify(rest)}`;
    }

    return output.replace(/\n/g, "\n\t\t\t\t\t\t");
});

let short_output_format = winston.format.printf((msg) => {
    let output = `${msg.timestamp.split(" ")[1]}\t${msg.level.toUpperCase()}\t${
        msg.message
    }`;

    let rest = { ...msg };
    delete rest.timestamp;
    delete rest.level;
    delete rest.message;
    delete rest[LEVEL];
    delete rest[SPLAT];
    delete rest[MESSAGE];
    if (Object.keys(rest).length > 0) {
        output += `\n${util.inspect(rest, { colors: true })}`;
    }

    return output.replace(/\n/g, "\n\t\t\t");
});

let rotate_transport_defaults = {
    format: winston.format.combine(default_output_format),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
};

let console_transport_defaults = {
    format: winston.format.combine(
        winston.format.colorize({ message: true }),
        isDev ? short_output_format : default_output_format
    ),
};

const prodChannel = "#logprodpe";

const clientProdChannel =
    prodChannel +
    (process.env.CUSTOMER !== "" ? `-${process.env.CUSTOMER}` : "");

const formatOutput = (msg) => {
    let output = `[${meta.customer}] ${msg.level.toUpperCase()}: ${
        msg.message
    }`;

    let rest = { ...msg };
    delete rest.timestamp;
    delete rest.level;
    delete rest.message;
    delete rest[LEVEL];
    delete rest[SPLAT];
    delete rest[MESSAGE];
    if (Object.keys(rest).length > 0) {
        output += `\n\`\`\`${util.inspect(rest)}\`\`\``;
    }

    return output;
};

let slack_transport_defaults = {
    level: "info",
    url:
        "https://hooks.slack.com/services/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",
    channel: process.env.CONTEXT === "PROD" ? prodChannel : "#logstagingpe",
    format: winston.format.combine(
        winston.format.printf((msg) => {
            if (["info", "warn"].includes(msg.level)) {
                // exclude info+warn logs => client channels
                return false;
            }
            return formatOutput(msg);
        })
    ),
};

let slack_client_transport_defaults = {
    ...slack_transport_defaults,
    channel:
        process.env.CONTEXT === "PROD" ? clientProdChannel : "#logstagingpe",
    format: winston.format.combine(
        winston.format.printf((msg) => {
            if (!["info", "warn"].includes(msg.level)) {
                return false;
            }
            return formatOutput(msg);
        })
    ),
};

winston.configure({
    level: isDev
        ? process.env.CONTEXT === "TEST"
            ? "critical"
            : "silly"
        : "verbose",
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat()
    ),
    transports: [
        new winston.transports.Console({
            ...console_transport_defaults,
        }),
    ],
});

if (!isDev) {
    winston.add(
        new winston.transports.Slack({
            ...slack_transport_defaults,
        })
    );

    winston.add(
        new winston.transports.Slack({
            ...slack_client_transport_defaults,
        })
    );
    winston.add(
        new winston.transports.DailyRotateFile({
            filename: "logs/general-%DATE%.log",
            ...rotate_transport_defaults,
        })
    );
}

let access_logger_levels = {
    levels: {
        in: 0,
        out: 1,
    },
    colors: {
        in: "gray",
        out: "gray",
    },
};

winston.addColors(access_logger_levels.colors);

let access_logger = winston.createLogger({
    level: "out",
    levels: access_logger_levels.levels,
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        })
    ),
    transports: [
        new winston.transports.Console({
            ...console_transport_defaults,
        }),
    ],
});

if (!isDev) {
    access_logger.add(
        new winston.transports.DailyRotateFile({
            filename: "logs/access-%DATE%.log",
            ...rotate_transport_defaults,
        })
    );
}

function create_access_logger_stream(level) {
    return {
        write: function (msg) {
            access_logger.log(level, msg.substr(0, msg.length - 1));
        },
    };
}

/*
 * ---- MORGAN ----
 */
const _ = require("lodash");
const morgan = require("morgan");

function isObject(item) {
    return typeof item === "object" && !Array.isArray(item) && item !== null;
}

function isBase64String(string) {
    return string.substr(0, 45).match(/^data:.{1,30};base64,/);
}

function transformFiles(files) {
    let transformedFiles = {};
    for (let fileId of Object.keys(files)) {
        transformedFiles[fileId] = [];
        const uploadedFiles = files[fileId];

        uploadedFiles.forEach((file) => {
            if (file && file.contents && isBase64String(file.contents)) {
                file.contents = "------- Base64 image removed --------";
            }
            if (file && file.content && isBase64String(file.content)) {
                file.content = "------- Base64 image removed --------";
            }
            transformedFiles[fileId].push(file);
        });
    }

    return transformedFiles;
}

function removeContentsFromFiles(object) {
    if (!isObject(object)) {
        return object;
    }

    if (object.files) {
        object.files = transformFiles(object.files);
        return object;
    }

    if (object.filesToUpload) {
        const files = Object.keys(object.filesToUpload).reduce((acc, k) => {
            if (k === "forms") {
                acc[k] = object.filesToUpload[k];
            } else {
                acc[k] = [object.filesToUpload[k]];
            }

            return acc;
        }, {});
        const transformedFiles = transformFiles(files);
        object.filesToUpload = Object.keys(transformedFiles).reduce(
            (acc, k) => {
                if (k === "forms") {
                    acc[k] = transformedFiles[k];
                } else {
                    acc[k] = transformedFiles[k][0];
                }

                return acc;
            },
            {}
        );
        return object;
    }

    if (object.filename && object.content) {
        let files = {
            uploadFile: [{ content: object.content }],
        };
        object.content = transformFiles(files).uploadFile[0].contents;
        return object;
    }

    if (object.po && object.po.files) {
        object.po.files = transformFiles(object.po.files);
        return object;
    }

    return object;
}

morgan.token("body", function (req) {
    const clonedReq = _.cloneDeep(req);
    return clonedReq && clonedReq.body && Object.keys(clonedReq.body).length > 0
        ? JSON.stringify(removeContentsFromFiles(clonedReq.body), null, 2)
        : "";
});
morgan.token("client-addr", function (req) {
    const xForwardedFor = req.get("X-Forwarded-For");

    return xForwardedFor || req.connection.remoteAddress;
});

morgan.format(
    "request",
    ":client-addr :method :url\nReferrer :referrer\nBody length in bytes :req[Content-Length]\nBody: :body"
);
morgan.format(
    "response",
    ":client-addr :method :url :status :response-time ms"
);

let morgan_request = morgan("request", {
    immediate: true,
    skip: function (req) {
        return (
            req.originalUrl.includes("/public/uploadFile") ||
            req.originalUrl === "/admin/orders/export" ||
            Buffer.isBuffer(req.body) ||
            req.method === "OPTIONS"
        );
    },
    stream: create_access_logger_stream("in"),
});

let morgan_response = morgan("response", {
    skip: function (req) {
        return req.method === "OPTIONS";
    },
    stream: create_access_logger_stream("out"),
});

/*
 * ---- CONSOLE ----
 */
console.debug = function () {
    winston.silly(
        "console.log called, please update call to appropriate winston method"
    );
    winston.debug.apply(null, arguments);
};

console.log = function () {
    winston.silly(
        "console.log called, please update call to appropriate winston method"
    );
    winston.verbose.apply(null, arguments);
};

console.info = function () {
    winston.silly(
        "console.info called, please update call to appropriate winston method"
    );
    winston.info.apply(null, arguments);
};

console.warn = function () {
    winston.silly(
        "console.warn called, please update call to appropriate winston method"
    );
    winston.warn.apply(null, arguments);
};

console.error = function () {
    winston.silly(
        "console.error called, please update call to appropriate winston method"
    );
    winston.error.apply(null, arguments);
};

/*
 * ---- MODULE ----
 */
module.exports = {
    loggers: {
        general: winston,
        access: access_logger,
    },
    morgan: {
        request: morgan_request,
        response: morgan_response,
    },
};
