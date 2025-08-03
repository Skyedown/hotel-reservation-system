"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronService = exports.CronService = void 0;
const cron = __importStar(require("node-cron"));
const reservationStateMachine_1 = require("./reservationStateMachine");
const sendGridEmailService_1 = require("./sendGridEmailService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CronService {
    constructor() {
        this.tasks = [];
    }
    start() {
        console.log('🕒 Starting cron services...');
        // Cleanup expired reservations every 5 minutes
        const cleanupTask = cron.schedule('*/5 * * * *', async () => {
            try {
                const cleanedUp = await reservationStateMachine_1.reservationStateMachine.cleanupExpiredReservations();
                if (cleanedUp > 0) {
                    console.log(`🧹 Cleaned up ${cleanedUp} expired reservations`);
                }
            }
            catch (error) {
                console.error('Error in reservation cleanup:', error);
            }
        });
        // Schedule check-in reminders (every hour)
        const scheduleRemindersTask = cron.schedule('0 * * * *', async () => {
            try {
                await this.scheduleCheckInReminders();
            }
            catch (error) {
                console.error('Error scheduling check-in reminders:', error);
            }
        });
        // Process scheduled reminder emails (every 15 minutes)
        const reminderTask = cron.schedule('*/15 * * * *', async () => {
            try {
                await this.processReminders();
            }
            catch (error) {
                console.error('Error processing reminders:', error);
            }
        });
        // Daily cleanup of old cancelled reservations (at 2 AM)
        const dailyCleanupTask = cron.schedule('0 2 * * *', async () => {
            try {
                await this.cleanupOldReservations();
            }
            catch (error) {
                console.error('Error in daily cleanup:', error);
            }
        });
        this.tasks = [cleanupTask, scheduleRemindersTask, reminderTask, dailyCleanupTask];
        // Start all tasks
        this.tasks.forEach(task => task.start());
        console.log('✅ Cron services started successfully');
    }
    stop() {
        console.log('🛑 Stopping cron services...');
        this.tasks.forEach(task => task.stop());
        this.tasks = [];
        console.log('✅ Cron services stopped');
    }
    // Schedule check-in reminder emails for confirmed reservations
    async scheduleCheckInReminders() {
        console.log('📅 Scheduling check-in reminder emails...');
        try {
            // Schedule check-in reminders for confirmed reservations
            const confirmedReservations = await prisma.reservation.findMany({
                where: {
                    status: 'CONFIRMED',
                    checkIn: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 25 * 60 * 60 * 1000) // Within next 25 hours
                    }
                },
                include: {
                    room: true,
                    emailReminders: true
                }
            });
            for (const reservation of confirmedReservations) {
                const hasCheckInReminder = reservation.emailReminders.some(r => r.emailType === 'CHECKIN_REMINDER_24H');
                if (!hasCheckInReminder) {
                    const checkInDate = new Date(reservation.checkIn);
                    const reminderTime = new Date(checkInDate.getTime() - (24 * 60 * 60 * 1000)); // 24 hours before
                    if (reminderTime > new Date()) {
                        await prisma.emailReminder.create({
                            data: {
                                reservationId: reservation.id,
                                emailType: 'CHECKIN_REMINDER_24H',
                                scheduledFor: reminderTime,
                                status: 'PENDING'
                            }
                        });
                        console.log(`📧 Scheduled check-in reminder for reservation ${reservation.id}`);
                    }
                }
            }
        }
        catch (error) {
            console.error('Error scheduling check-in reminders:', error);
        }
    }
    // Process and send scheduled reminder emails
    async processReminders() {
        console.log('📬 Processing scheduled reminder emails...');
        try {
            // Find all pending reminders that are due to be sent
            const dueReminders = await prisma.emailReminder.findMany({
                where: {
                    status: 'PENDING',
                    scheduledFor: {
                        lte: new Date()
                    },
                    attempts: {
                        lt: 3 // Don't retry more than 3 times
                    }
                },
                include: {
                    reservation: {
                        include: {
                            room: true
                        }
                    }
                }
            });
            for (const reminder of dueReminders) {
                try {
                    const reservation = reminder.reservation;
                    // Skip if reservation is no longer confirmed for check-in reminders
                    if (reservation.status !== 'CONFIRMED' && reminder.emailType === 'CHECKIN_REMINDER_24H') {
                        await prisma.emailReminder.update({
                            where: { id: reminder.id },
                            data: { status: 'CANCELLED' }
                        });
                        continue;
                    }
                    // Send the appropriate reminder email
                    switch (reminder.emailType) {
                        case 'CHECKIN_REMINDER_24H':
                            await sendGridEmailService_1.sendGridEmailService.sendCheckInReminder24H(reservation);
                            break;
                        default:
                            console.warn(`Unknown email type: ${reminder.emailType}`);
                            continue;
                    }
                    // Mark as sent
                    await prisma.emailReminder.update({
                        where: { id: reminder.id },
                        data: { status: 'SENT' }
                    });
                    console.log(`✅ Sent ${reminder.emailType} reminder for reservation ${reservation.id}`);
                }
                catch (error) {
                    console.error(`Failed to send reminder ${reminder.id}:`, error);
                    // Mark as failed if max attempts reached
                    if (reminder.attempts >= 2) {
                        await prisma.emailReminder.update({
                            where: { id: reminder.id },
                            data: {
                                status: 'FAILED',
                                lastError: error instanceof Error ? error.message : 'Unknown error',
                                attempts: { increment: 1 }
                            }
                        });
                    }
                    else {
                        // Schedule for retry in 5 minutes
                        await prisma.emailReminder.update({
                            where: { id: reminder.id },
                            data: {
                                scheduledFor: new Date(Date.now() + 5 * 60 * 1000),
                                attempts: { increment: 1 },
                                lastError: error instanceof Error ? error.message : 'Unknown error'
                            }
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error('Error processing reminders:', error);
        }
    }
    async cleanupOldReservations() {
        console.log('🗑️ Running daily cleanup of old reservations...');
        // Clean up cancelled reservations older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Note: In a production system, you might want to archive these instead of deleting
        // or just clean up sensitive data while keeping records for analytics
    }
    // Get status of all cron jobs
    getStatus() {
        return [
            {
                task: 'Expired Reservations Cleanup (every 5 minutes)',
                active: this.tasks.length > 0
            },
            {
                task: 'Check-in Reminder Scheduling (hourly)',
                active: this.tasks.length > 1
            },
            {
                task: 'Reminder Email Processing (every 15 minutes)',
                active: this.tasks.length > 2
            },
            {
                task: 'Daily Cleanup (2 AM daily)',
                active: this.tasks.length > 3
            }
        ];
    }
}
exports.CronService = CronService;
exports.cronService = new CronService();
//# sourceMappingURL=cronService.js.map