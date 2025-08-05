import { ReservationStatus } from '@prisma/client';
export interface ReservationTransition {
    from: ReservationStatus[];
    to: ReservationStatus;
    conditions?: (reservation: any) => boolean;
    actions?: (reservation: any) => Promise<void>;
}
export declare class ReservationStateMachine {
    private transitions;
    constructor();
    private defineTransitions;
    transition(reservationId: string, action: string): Promise<boolean>;
    canTransition(reservationId: string, action: string): Promise<boolean>;
    getAvailableTransitions(status: ReservationStatus): string[];
}
export declare const reservationStateMachine: ReservationStateMachine;
//# sourceMappingURL=reservationStateMachine.d.ts.map