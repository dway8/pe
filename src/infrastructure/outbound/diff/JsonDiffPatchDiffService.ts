import { DiffPatcher } from "jsondiffpatch";

import { IDiffService } from "@interfaces/IDiffService";

export class JsonDiffPatchDiffService implements IDiffService {
    jsondiffpatch: any;

    constructor() {
        this.jsondiffpatch = new DiffPatcher({
            textDiff: { minLength: 2147483647 },
        });
    }

    diff(
        oldObj: Record<string, any>,
        newObj: Record<string, any>
    ): Record<string, any> {
        return this.jsondiffpatch.diff(oldObj, newObj);
    }
}
