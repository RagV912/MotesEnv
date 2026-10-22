import { DEFAULT_ADMIN_CREDENTIALS } from './adminCredentials';

/**
 * Security Email Notification Service
 * 
 * Handles sending administrative security alerts (such as Emergency Reset, 
 * Login Failures, or Configuration overrides) to the company's designated
 * security contact.
 * 
 * Since a backend service is not yet established, this client-side implementation
 * acts as a robust stub. Once the server/API is integrated, you can replace
 * the fetch/payload logic here.
 */

// Designated company email address (currently empty per instructions since backend is not yet established)
export const COMPANY_SECURITY_EMAIL = ""; 

export interface SecurityAlertPayload {
  alertType: string;
  timestamp: string;
  details: string;
  affectedCredentials: {
    adminId: string;
    email: string;
  };
}

/**
 * Sends a security notification email.
 * Logs to console and prepares for future API dispatch.
 */
export async function sendSecurityNotificationEmail(payload: SecurityAlertPayload): Promise<boolean> {
  const timestamp = new Date().toISOString();
  console.log(`%c[EMAIL SERVICE ALERT] Security Notification Triggered at ${timestamp}`, 'color: #ef4444; font-weight: bold; font-size: 14px;');
  console.log('%cPayload details:', 'color: #fbbf24;', payload);

  if (!COMPANY_SECURITY_EMAIL) {
    console.warn("[EMAIL SERVICE] Destination COMPANY_SECURITY_EMAIL is currently empty. Please configure this in /src/emailService.ts once your SMTP or backend email service is ready.");
  } else {
    console.log(`[EMAIL SERVICE] Target Dispatch Address: ${COMPANY_SECURITY_EMAIL}`);
  }

  try {
    // Under a future full-stack implementation, this would trigger an API call:
    /*
    const response = await fetch('/api/security/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: COMPANY_SECURITY_EMAIL,
        subject: `[SECURITY ALERT] ${payload.alertType}`,
        body: `
          SECURITY WARNING: An administrative action occurred.
          Event: ${payload.alertType}
          Time: ${payload.timestamp}
          Details: ${payload.details}
          
          Affected Account:
          - ID: ${payload.affectedCredentials.adminId}
          - Configured Email: ${payload.affectedCredentials.email}
          
          Please verify if this was authorized.
        `
      })
    });
    return response.ok;
    */
    
    // Simulate successful API dispatch placeholder
    return true;
  } catch (error) {
    console.error("[EMAIL SERVICE] Failed to send security email:", error);
    return false;
  }
}
