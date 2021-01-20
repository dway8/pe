export interface IDiffService {
    diff(
        oldObj: Record<string, any>,
        newObj: Record<string, any>
    ): Record<string, any>;
}
