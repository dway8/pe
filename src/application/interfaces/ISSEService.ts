export interface ISSEService {
    send(data: Record<any, string>, tag: string): void;
}
