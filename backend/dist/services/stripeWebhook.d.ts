import Stripe from 'stripe';
export declare class StripeWebhookHandler {
    private endpointSecret;
    constructor();
    verifyWebhookSignature(payload: string, signature: string): Stripe.Event;
    handleWebhookEvent(event: Stripe.Event): Promise<void>;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    private handlePaymentCanceled;
    private handleChargeDispute;
    createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<Stripe.Refund>;
    isEventProcessed(eventId: string): Promise<boolean>;
}
export declare const stripeWebhookHandler: StripeWebhookHandler;
//# sourceMappingURL=stripeWebhook.d.ts.map