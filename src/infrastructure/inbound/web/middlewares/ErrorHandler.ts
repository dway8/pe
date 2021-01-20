import { ILoggerService } from "@interfaces/ILoggerService";

export default (LoggerService: ILoggerService) => {
    (err, req, res, _next) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        LoggerService.error(
            `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
                req.method
            } - ${req.ip}`
        );

        res.json({ success: false, error: err.message });
    };
};
