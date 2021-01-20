export type Patch = {
    id?: string;
    date: number;
    action: string;
    role: string;
    orderId: string;
    diff: any;
    username: string | null;
};
