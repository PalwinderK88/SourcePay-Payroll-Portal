const Notification = require('../models/Notification');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Send notification to user
  async sendNotification(user_id, type, title, message, link = null) {
    try {
      // Check user preferences
      const preferences = await Notification.getPreferences(user_id);
      
      // Check if user wants this type of notification
      const typePreferenceMap = {
        'payslip': 'payslip_notifications',
        'document': 'document_notifications',
        'contract': 'contract_notifications',
        'pension': 'pension_notifications'
      };
      
      const preferenceKey = typePreferenceMap[type];
      if (preferenceKey && !preferences[preferenceKey]) {
        console.log(`⏭️  User ${user_id} has disabled ${type} notifications`);
        return null;
      }

      // Create notification in database
      const notification = await Notification.create(user_id, type, title, message, link);
      
      // Send real-time notification via Socket.IO if enabled
      if (preferences.push_notifications) {
        this.io.to(`user_${user_id}`).emit('notification', notification);
        console.log(`📤 Real-time notification sent to user ${user_id}`);
      }

      return notification;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return null;
    }
  }

  // Notification templates for different events
  async notifyPayslipUploaded(user_id, month, year) {
    return await this.sendNotification(
      user_id,
      'payslip',
      '💰 New Payslip Available',
      `Your payslip for ${month} ${year} is now available to view and download.`,
      '/dashboard?tab=payslips'
    );
  }

  async notifyDocumentExpiring(user_id, doc_type, days) {
    const urgency = days <= 7 ? '🚨' : '⚠️';
    return await this.sendNotification(
      user_id,
      'document',
      `${urgency} Document Expiring Soon`,
      `Your ${doc_type} will expire in ${days} ${days === 1 ? 'day' : 'days'}. Please upload a new one.`,
      '/dashboard?tab=documents'
    );
  }

  async notifyDocumentExpired(user_id, doc_type) {
    return await this.sendNotification(
      user_id,
      'document',
      '🚨 Document Expired',
      `Your ${doc_type} has expired. Please upload a new one immediately to avoid payment delays.`,
      '/dashboard?tab=documents'
    );
  }

  async notifyDocumentMissing(user_id, doc_type) {
    return await this.sendNotification(
      user_id,
      'document',
      '📄 Required Document Missing',
      `Please upload your ${doc_type} to complete your onboarding.`,
      '/dashboard?tab=documents'
    );
  }

  async notifyContractReady(user_id, contract_name) {
    return await this.sendNotification(
      user_id,
      'contract',
      '📝 Contract Ready to Sign',
      `Your ${contract_name} is ready for review and signature.`,
      '/dashboard?tab=contracts'
    );
  }

  async notifyPensionEnrollment(user_id) {
    return await this.sendNotification(
      user_id,
      'pension',
      '🏦 Pension Enrollment Required',
      `You are now eligible for pension enrollment. Please review and complete your enrollment.`,
      '/dashboard?tab=pension'
    );
  }

  async notifyPaymentProcessed(user_id, amount) {
    return await this.sendNotification(
      user_id,
      'payslip',
      '✅ Payment Processed',
      `Your payment of £${amount} has been processed and will arrive in your account soon.`,
      '/dashboard?tab=payslips'
    );
  }

  async notifyAccountUpdate(user_id, update_type) {
    return await this.sendNotification(
      user_id,
      'account',
      'ℹ️ Account Update',
      `Your ${update_type} has been updated successfully.`,
      '/dashboard'
    );
  }
}

module.exports = NotificationService;
