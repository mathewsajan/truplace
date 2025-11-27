import { supabase } from './supabase';

interface SendEmailParams {
  recipientEmail: string;
  recipientName?: string;
  emailType: 'company_approved' | 'company_rejected';
  companyName: string;
  notificationToken: string;
  rejectionReason?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const sendCompanyApprovedEmail = async (
  recipientEmail: string,
  companyName: string,
  notificationToken: string,
  recipientName?: string
): Promise<EmailResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        recipientEmail,
        recipientName,
        emailType: 'company_approved',
        companyName,
        notificationToken,
      } as SendEmailParams,
    });

    if (error) {
      console.error('Error invoking send-email function:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    return data as EmailResponse;
  } catch (error) {
    console.error('Error sending company approved email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const sendCompanyRejectedEmail = async (
  recipientEmail: string,
  companyName: string,
  notificationToken: string,
  rejectionReason: string,
  recipientName?: string
): Promise<EmailResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        recipientEmail,
        recipientName,
        emailType: 'company_rejected',
        companyName,
        notificationToken,
        rejectionReason,
      } as SendEmailParams,
    });

    if (error) {
      console.error('Error invoking send-email function:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    return data as EmailResponse;
  } catch (error) {
    console.error('Error sending company rejected email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
