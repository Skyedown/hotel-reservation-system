import { Reservation, RoomType, ActualRoom, EmailType } from '@prisma/client';
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
        roomType: RoomType;
        actualRoom: ActualRoom | null;
    }): EmailTemplate;
    generatePaymentConfirmationEmail(reservation: Reservation & {
        roomType: RoomType;
        actualRoom: ActualRoom | null;
    }): EmailTemplate;
    sendCheckInReminder24H(reservation: Reservation & {
        roomType: RoomType;
        actualRoom: ActualRoom | null;
    }): Promise<void>;
    sendPaymentConfirmationEmail(reservation: Reservation & {
        roomType: RoomType;
        actualRoom: ActualRoom | null;
    }): Promise<void>;
    sendMultiRoomPaymentConfirmationEmail(reservations: (Reservation & {
        roomType: RoomType;
        actualRoom: ActualRoom | null;
    })[]): Promise<void>;
    generateMultiRoomPaymentConfirmationEmail(reservations: (Reservation & {
        roomType: RoomType;
        actualRoom: ActualRoom | null;
    })[]): EmailTemplate;
    generateCancellationEmail(reservation: Reservation & {
        roomType: RoomType;
        actualRoom: ActualRoom | null;
    }): EmailTemplate;
    generatePaymentFailedEmail(reservation: Reservation & {
        roomType: RoomType;
        actualRoom: ActualRoom | null;
    }): EmailTemplate;
    sendCancellationEmail(reservation: Reservation & {
        roomType: RoomType;
        actualRoom: ActualRoom | null;
    }): Promise<void>;
    sendPaymentFailedEmail(reservation: Reservation & {
        roomType: RoomType;
        actualRoom: ActualRoom | null;
    }): Promise<void>;
    private markReminderAsSent;
    private markReminderAsFailed;
}
export declare const sendGridEmailService: SendGridEmailService;
//# sourceMappingURL=sendGridEmailService.d.ts.map