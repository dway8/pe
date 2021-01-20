import SSE from "express-sse";

import { ISSEService } from "@interfaces/ISSEService";

export class ExpressSSEService implements ISSEService {
    sse: any;
    sses: any;

    constructor() {
        this.sse = new SSE(["Connected!"]);
        this.sses = {};
    }

    getSseForId = (id) => {
        if (!this.sses[id]) {
            this.sses[id] = new SSE([]);
        }
        return this.sses[id];
    };

    initSseForId = (id, req, res) => {
        const sse = this.getSseForId(id);
        res.flush = res.flushHeaders;
        sse.init(req, res);
        sse.send("Connected!");
    };

    sendToSseForId = (id, { content, tag }) => {
        this.getSseForId(id).send(content, tag);
    };

    send(data: Record<any, string>, tag: string): void {
        this.sse.send(data, tag);
    }
}
