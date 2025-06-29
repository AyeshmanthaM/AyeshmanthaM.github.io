interface EmailData {
  to: string;
  subject: string;
  message: string;
  from?: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
}

class EmailService {
  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-cloudflare-worker.your-domain.workers.dev';

  async sendEmail(to: string, subject: string, message: string): Promise<EmailResponse> {
    try {
      const emailData: EmailData = {
        to,
        subject,
        message,
        from: 'admin@ayeshmantha.net'
      };

      const response = await fetch(`${this.API_BASE_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Email sending error:', error);
      
      // Fallback to mailto for development/testing
      if (import.meta.env.DEV) {
        return this.fallbackToMailto(to, subject, message);
      }
      
      throw new Error('Failed to send email');
    }
  }

  private fallbackToMailto(to: string, subject: string, message: string): EmailResponse {
    try {
      const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      window.open(mailtoUrl, '_blank');
      
      return {
        success: true,
        message: 'Email client opened. Please send manually.'
      };
    } catch (error) {
      console.error('Mailto fallback error:', error);
      return {
        success: false,
        message: 'Failed to open email client'
      };
    }
  }

  private getAuthToken(): string {
    // In a real implementation, this would get the auth token
    // For now, return a placeholder
    return 'admin-token';
  }

  async sendContactForm(formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<EmailResponse> {
    const emailMessage = `
Contact Form Submission:

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from ayeshmantha.net contact form
    `.trim();

    return this.sendEmail(
      'ayesh@ayeshmantha.net', // Your email
      `Contact Form: ${formData.subject}`,
      emailMessage
    );
  }

  async sendNotification(type: 'backup' | 'login' | 'error', details: string): Promise<void> {
    try {
      const subject = `Admin Notification: ${type.toUpperCase()}`;
      const message = `
Admin Dashboard Notification:

Type: ${type}
Timestamp: ${new Date().toISOString()}
Details: ${details}

---
Automated notification from ayeshmantha.net admin dashboard
      `.trim();

      await this.sendEmail('ayesh@ayeshmantha.net', subject, message);
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Don't throw error for notifications to avoid breaking main functionality
    }
  }

  // Test email functionality
  async testEmailService(): Promise<EmailResponse> {
    const testMessage = `
This is a test email from the admin dashboard.

Timestamp: ${new Date().toISOString()}
System: ayeshmantha.net admin panel

If you receive this email, the email service is working correctly.
    `.trim();

    return this.sendEmail(
      'ayesh@ayeshmantha.net',
      'Admin Dashboard - Email Service Test',
      testMessage
    );
  }
}

export const emailService = new EmailService();
