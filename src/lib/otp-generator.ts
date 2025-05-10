// utils/otpUtils.ts
export function generateOTP(length: number = 6): string {
    // Generate a random numeric OTP of the specified length
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }
  
  // Set expiration time (typically 10 minutes)
  export function getOTPExpiryTime(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    return expiresAt;
  }