export interface ILoggerService {
    debug(msg: string, params?: Record<string, any>): any;
    info(msg: string, params?: Record<string, any>): any;
    warn(msg: string, params?: Record<string, any>): any;
    verbose(msg: string, params?: Record<string, any>): any;
    error(msg: string, params?: Record<string, any>): any;
}
