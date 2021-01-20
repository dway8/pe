export type CustomerOptions = {
    customer: { customerName: string };
    events: Record<
        string,
        {
            tokens?: string[];
            disableMailing: boolean;
            organizerEmail: string;
            paymentContext: string;
            vads: string;
        }
    >[];
};
