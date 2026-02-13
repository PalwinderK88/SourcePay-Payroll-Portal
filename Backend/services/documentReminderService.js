const cron = require('node-cron');
const Document = require('../models/Document');
const { sendDocumentReminderEmail, sendDocumentExpiredEmail } = require('./emailService');

class DocumentReminderService {
  constructor() {
    this.isRunning = false;
  }

  // Start the cron jobs
  start() {
    if (this.isRunning) {
      console.log('⚠️  Document reminder service is already running');
      return;
    }

    console.log('🚀 Starting document reminder service...');

    // Run daily at 9:00 AM
    this.dailyCheck = cron.schedule('0 9 * * *', async () => {
      console.log('📅 Running daily document expiry check...');
      await this.checkExpiringDocuments();
      await this.checkExpiredDocuments();
    });

    // Also run immediately on startup for testing
    this.checkExpiringDocuments();
    this.checkExpiredDocuments();

    this.isRunning = true;
    console.log('✅ Document reminder service started successfully');
  }

  // Stop the cron jobs
  stop() {
    if (this.dailyCheck) {
      this.dailyCheck.stop();
    }
    this.isRunning = false;
    console.log('🛑 Document reminder service stopped');
  }

  // Check for documents expiring soon and send reminders
  async checkExpiringDocuments() {
    try {
      console.log('🔍 Checking for expiring documents...');

      // Check documents expiring in 30 days
      const expiringSoon = await Document.getExpiringSoon(30);
      
      if (expiringSoon.length === 0) {
        console.log('✅ No documents expiring in the next 30 days');
        return;
      }

      console.log(`📧 Found ${expiringSoon.length} documents expiring soon`);

      for (const doc of expiringSoon) {
        const daysUntilExpiry = this.calculateDaysUntilExpiry(doc.expiry_date);
        
        // Send reminders at 30, 14, 7, 3, and 1 days before expiry
        const reminderDays = [30, 14, 7, 3, 1];
        
        if (reminderDays.includes(daysUntilExpiry)) {
          // Check if we already sent a reminder today
          const lastReminder = doc.last_reminder_date;
          const today = new Date().toISOString().split('T')[0];
          
          if (lastReminder === today) {
            console.log(`⏭️  Skipping ${doc.doc_type} for ${doc.user_name} - reminder already sent today`);
            continue;
          }

          // Send reminder email
          await sendDocumentReminderEmail(
            doc.user_email,
            doc.user_name,
            doc.doc_type,
            doc.expiry_date,
            daysUntilExpiry
          );

          // Send in-app notification
          if (this.notificationService) {
            await this.notificationService.notifyDocumentExpiring(doc.user_id, doc.doc_type, daysUntilExpiry);
          }

          // Update reminder sent flag
          await Document.updateReminderSent(doc.id);

          console.log(`✅ Sent reminder for ${doc.doc_type} to ${doc.user_name} (${daysUntilExpiry} days until expiry)`);
        }
      }
    } catch (error) {
      console.error('❌ Error checking expiring documents:', error);
    }
  }

  // Check for expired documents and send notifications
  async checkExpiredDocuments() {
    try {
      console.log('🔍 Checking for expired documents...');

      const expired = await Document.getExpired();
      
      if (expired.length === 0) {
        console.log('✅ No expired documents found');
        return;
      }

      console.log(`📧 Found ${expired.length} expired documents`);

      for (const doc of expired) {
        // Only send notification if document is still marked as active
        if (doc.status === 'active') {
          // Send expiry notification
          await sendDocumentExpiredEmail(
            doc.user_email,
            doc.user_name,
            doc.doc_type,
            doc.expiry_date
          );

          // Send in-app notification
          if (this.notificationService) {
            await this.notificationService.notifyDocumentExpired(doc.user_id, doc.doc_type);
          }

          // Update document status to expired
          await Document.updateStatus(doc.id, 'expired');

          console.log(`✅ Marked ${doc.doc_type} as expired for ${doc.user_name}`);
        }
      }
    } catch (error) {
      console.error('❌ Error checking expired documents:', error);
    }
  }

  // Calculate days until expiry
  calculateDaysUntilExpiry(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Manual trigger for testing
  async triggerManualCheck() {
    console.log('🔧 Manual document check triggered');
    await this.checkExpiringDocuments();
    await this.checkExpiredDocuments();
  }
}

// Create singleton instance
const documentReminderService = new DocumentReminderService();

module.exports = documentReminderService;
