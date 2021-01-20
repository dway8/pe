import { loggers } from "./logger";
import { ILoggerService } from "@interfaces/ILoggerService";

export class WinstonLoggerService implements ILoggerService {
    winston: any;

    constructor() {
        this.winston = loggers.general;
    }

    debug(msg: string, params: Record<string, any>): any {
        this.winston.debug(msg, params);
    }

    info(msg: string, params: Record<string, any>): any {
        this.winston.info(msg, params);
    }

    warn(msg: string, params: Record<string, any>): any {
        this.winston.warn(msg, params);
    }

    verbose(msg: string, params: Record<string, any>): any {
        this.winston.verbose(msg, params);
    }

    error(msg: string, params: Record<string, any>): any {
        this.winston.error(msg, params);
    }
}
