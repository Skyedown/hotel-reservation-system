import { Reservation, Room, EmailType } from '@prisma/client';
export interface EmailTemplate {
    templateId?: string;
    subject: string;
    html: string;
    text: string;
    dynamicTemplateData?: Record<string, any>;
}
export declare class SendGridEmailService {
    private initialized;
    constructor();
    private initialize;
    sendEmail(to: string, template: EmailTemplate, emailType?: EmailType, reservationId?: string): Promise<void>;
    generateCheckInReminder24H(reservation: Reservation & {
        room: Room;
    }): EmailTemplate;
    generatePaymentConfirmationEmail(reservation: Reservation & {
        room: Room;
    }): EmailTemplate;
    sendCheckInReminder24H(reservation: Reservation & {
        room: Room;
    }): Promise<void>;
    sendPaymentConfirmationEmail(reservation: Reservation & {
        room: Room;
    }): Promise<void>;
    sendMultiRoomPaymentConfirmationEmail(reservations: (Reservation & {
        room: Room;
    })[]): Promise<void>;
    generateMultiRoomPaymentConfirmationEmail(reservations: (Reservation & {
        room: Room;
    })[]): EmailTemplate;
    generateCancellationEmail(reservation: Reservation & {
        room: Room;
    }): EmailTemplate;
    generatePaymentFailedEmail(reservation: Reservation & {
        room: Room;
    }): EmailTemplate;
    sendCancellationEmail(reservation: Reservation & {
        room: Room;
    }): Promise<void>;
    sendPaymentFailedEmail(reservation: Reservation & {
        room: Room;
    }): Promise<void>;
    private markReminderAsSent;
    private markReminderAsFailed;
}
export declare const sendGridEmailService: SendGridEmailService;
//# sourceMappingURL=sendGridEmailService.d.ts.map