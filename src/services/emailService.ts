// Email service configuration and utilities
// This file provides multiple email sending options for the contact form

interface EmailFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Email service configuration
const EMAIL_CONFIG = {
  // Your email address
  recipientEmail: 'info@ayeshmantha.net',
};

/**
 * Send email using Resend via Cloudflare Worker
 */
export const sendEmailViaResend = async (data: EmailFormData): Promise<EmailResponse> => {
  try {
    const response = await fetch('https://notion-cors-proxy.maduranga-ayeshmantha.workers.dev/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { 
        success: true, 
        message: 'Email sent successfully via Resend' 
      };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email via Resend');
    }
  } catch (error) {
    console.error('Resend email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Fallback to mailto link
 */
export const sendEmailViaMailto = async (data: EmailFormData): Promise<EmailResponse> => {
  try {
    const subject = encodeURIComponent(data.subject);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
    );
    const mailtoUrl = `mailto:${EMAIL_CONFIG.recipientEmail}?subject=${subject}&body=${body}`;
    
    window.open(mailtoUrl, '_blank');
    return { 
      success: true, 
      message: 'Email client opened' 
    };
  } catch (error) {
    console.error('Mailto error:', error);
    return { 
      success: false, 
      error: 'Failed to open email client' 
    };
  }
};

/**
 * Main email sending function with fallback to mailto
 */
export const sendEmail = async (data: EmailFormData): Promise<EmailResponse> => {
  // Validate form data
  if (!data.name || !data.email || !data.subject || !data.message) {
    return { 
      success: false, 
      error: 'Please fill in all required fields' 
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { 
      success: false, 
      error: 'Please enter a valid email address' 
    };
  }

  // Try Resend via Cloudflare Worker first
  try {
    const result = await sendEmailViaResend(data);
    if (result.success) {
      return result;
    }
  } catch (error) {
    console.error('Resend service failed:', error);
  }

  // If Resend fails, use mailto as fallback
  return await sendEmailViaMailto(data);
};

export default {
  sendEmail,
  sendEmailViaResend,
  sendEmailViaMailto,
  EMAIL_CONFIG,
};
