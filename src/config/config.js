let config;
try {
    // patch #4 for running inside AIO container
    if (process.env.CONTEXT === "PREPROD" || process.env.CONTEXT === "PROD") {
        config = require("./production");
    } else if (process.env.CONTEXT === "TEST") {
        config = require("./test");
    } else {
        config = require("./dev");
    }
} catch (e) {
    console.error("Could not open configuration fileeee.");
    process.exit(1);
}

export default config;
