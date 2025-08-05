/**
 * Twilio Service for SMS Authentication and Invitations
 * Note: This is a frontend implementation for demo purposes.
 * In a production app, these functions should be implemented as secure backend APIs.
 */

import { toast } from "sonner";

// In a real application, these would be environment variables
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID as string;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN as string;
const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER as string;

// Simulated verification codes store (would be handled by a backend in production)
const verificationCodes: Record<string, { code: string; expiry: number }> = {};

/**
 * Generate a random verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send SMS verification code
 * @param phoneNumber The phone number to send the code to
 * @returns Promise resolving to success status
 */
export async function sendVerificationSMS(phoneNumber: string): Promise<boolean> {
  try {
    // Generate a 6-digit verification code
    const code = generateVerificationCode();
    
    // In a real app, this would call Twilio API to send an SMS
    console.log(`[TWILIO MOCK] Sending verification code ${code} to ${phoneNumber}`);
    
    // For demo purposes, we'll simulate storing the code with a 5-minute expiry
    verificationCodes[phoneNumber] = {
      code: code,
      expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For testing in development, we'll show the code in a toast
    if (import.meta.env.DEV) {
      toast.info(`Verification code: ${code}`, {
        description: "Use this code to log in (shown only in development)",
        duration: 10000
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error sending verification SMS:", error);
    return false;
  }
}

/**
 * Verify SMS code
 * @param phoneNumber The phone number to verify
 * @param code The verification code to check
 * @returns Whether the verification was successful
 */
export function verifyCode(phoneNumber: string, code: string): boolean {
  const verification = verificationCodes[phoneNumber];
  
  if (!verification) {
    return false; // No verification found for this phone number
  }
  
  if (Date.now() > verification.expiry) {
    delete verificationCodes[phoneNumber]; // Clean up expired code
    return false; // Code expired
  }
  
  if (verification.code === code) {
    delete verificationCodes[phoneNumber]; // Clean up used code
    return true; // Code is valid
  }
  
  return false; // Code is invalid
}

/**
 * Send invitation SMS
 * @param phoneNumber The phone number to send the invitation to
 * @param inviterName Name of the person sending the invitation
 * @param role The role being assigned to the invitee
 * @returns Promise resolving to success status
 */
export async function sendInvitationSMS(
  phoneNumber: string, 
  inviterName: string,
  role: string
): Promise<boolean> {
  try {
    // In a real app, this would call Twilio API
    console.log(`[TWILIO MOCK] Sending invitation from ${inviterName} to ${phoneNumber} for role: ${role}`);
    
    // The invitation message that would be sent
    const message = 
      `${inviterName} has invited you to join TaskFlow Calendar as a ${role}. ` +
      `Click here to create your account: ${window.location.origin}/login?invited=true&phone=${encodeURIComponent(phoneNumber)}&role=${encodeURIComponent(role)}`;
    
    console.log(`[TWILIO MOCK] Message content: ${message}`);
    
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return true;
  } catch (error) {
    console.error("Error sending invitation SMS:", error);
    return false;
  }
}