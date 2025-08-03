import { Reservation, Room } from '@prisma/client';
export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}
export declare class EmailService {
    constructor();
    sendEmail(to: string, template: EmailTemplate): Promise<void>;
    generateConfirmationEmail(reservation: Reservation & {
        room: Room;
    }): EmailTemplate;
    generatePaymentFailedEmail(reservation: Reservation & {
        room: Room;
    }): EmailTemplate;
    generateCancellationEmail(reservation: Reservation & {
        room: Room;
    }): EmailTemplate;
    sendConfirmationEmail(reservation: Reservation & {
        room: Room;
    }): Promise<void>;
    sendPaymentFailedEmail(reservation: Reservation & {
        room: Room;
    }): Promise<void>;
    sendCancellationEmail(reservation: Reservation & {
        room: Room;
    }): Promise<void>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=emailService.d.ts.map