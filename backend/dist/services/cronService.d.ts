export declare class CronService {
    private tasks;
    start(): void;
    stop(): void;
    private scheduleCheckInReminders;
    private processReminders;
    private cleanupOldReservations;
    getStatus(): {
        task: string;
        active: boolean;
    }[];
}
export declare const cronService: CronService;
//# sourceMappingURL=cronService.d.ts.map