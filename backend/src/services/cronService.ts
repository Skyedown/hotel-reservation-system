import * as cron from 'node-cron';
import { reservationStateMachine } from './reservationStateMachine';
import { sendGridEmailService } from './sendGridEmailService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CronService {
  private tasks: cron.ScheduledTask[] = [];

  start(): void {
    console.log('🕒 Starting cron services...');


    // Schedule check-in reminders (every hour)
    const scheduleRemindersTask = cron.schedule('0 * * * *', async () => {
      try {
        await this.scheduleCheckInReminders();
      } catch (error) {
        console.error('Error scheduling check-in reminders:', error);
      }
    });

    // Process scheduled reminder emails (every 15 minutes)
    const reminderTask = cron.schedule('*/15 * * * *', async () => {
      try {
        await this.processReminders();
      } catch (error) {
        console.error('Error processing reminders:', error);
      }
    });

    // Daily cleanup of old cancelled reservations (at 2 AM)
    const dailyCleanupTask = cron.schedule('0 2 * * *', async () => {
      try {
        await this.cleanupOldReservations();
      } catch (error) {
        console.error('Error in daily cleanup:', error);
      }
    });

    this.tasks = [scheduleRemindersTask, reminderTask, dailyCleanupTask];

    // Start all tasks
    this.tasks.forEach(task => task.start());
    
    console.log('✅ Cron services started successfully');
  }

  stop(): void {
    console.log('🛑 Stopping cron services...');
    this.tasks.forEach(task => task.stop());
    this.tasks = [];
    console.log('✅ Cron services stopped');
  }

  // Schedule check-in reminder emails for confirmed reservations
  private async scheduleCheckInReminders(): Promise<void> {
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
          roomType: true,
          actualRoom: true,
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
    } catch (error) {
      console.error('Error scheduling check-in reminders:', error);
    }
  }

  // Process and send scheduled reminder emails
  private async processReminders(): Promise<void> {
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
              roomType: true,
              actualRoom: true
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
              await sendGridEmailService.sendCheckInReminder24H(reservation);
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

        } catch (error) {
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
          } else {
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
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  }

  private async cleanupOldReservations(): Promise<void> {
    console.log('🗑️ Running daily cleanup of old reservations...');
    
    // Clean up cancelled reservations older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Note: In a production system, you might want to archive these instead of deleting
    // or just clean up sensitive data while keeping records for analytics
  }

  // Get status of all cron jobs
  getStatus(): { task: string; active: boolean }[] {
    return [
      {
        task: 'Check-in Reminder Scheduling (hourly)',
        active: this.tasks.length > 0
      },
      {
        task: 'Reminder Email Processing (every 15 minutes)',
        active: this.tasks.length > 1
      },
      {
        task: 'Daily Cleanup (2 AM daily)',
        active: this.tasks.length > 2
      }
    ];
  }
}

export const cronService = new CronService();