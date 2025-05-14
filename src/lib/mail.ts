// mailer.ts
import nodemailer from "nodemailer";

/**
 * Sends an email using nodemailer
 * @param senderHeader - The sender's name to display in the email
 * @param email - Recipient email address
 * @param subject - Email subject
 * @param content - HTML content of the email
 * @returns Promise with email info
 */
export const sendEmail = async (
  senderHeader: string,
  email: string,
  subject: string,
  content: string
) => {
  // Check if required environment variables are set
  const requiredVars = [
    'NODEMAILER_HOST', 
    'NODEMAILER_PORT', 
    'NODEMAILER_EMAIL_USER', 
    'NODEMAILER_EMAIL_PASSWORD'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    throw new Error(`Email configuration incomplete. Missing: ${missingVars.join(', ')}`);
  }
  
// NODEMAILER_HOST="mail.gennextit.com"
// NODEMAILER_PORT=465
// NODEMAILER_EMAIL_USER=" emailtesting@gennextit.com"
// NODEMAILER_EMAIL_PASSWORD="*&7hE{gyU+X("

  // Log email configuration (without password)
  console.log("Email configuration:", {
    host: process.env.NODEMAILER_HOST,
    port: Number(process.env.NODEMAILER_PORT),
    secure: true,
    user: process.env.NODEMAILER_EMAIL_USER,
    // Password omitted for security
  });

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: Number(process.env.NODEMAILER_PORT),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.NODEMAILER_EMAIL_USER,
      pass: process.env.NODEMAILER_EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: process.env.NODE_ENV !== 'production', // Enable debug in non-production environments
  });

  // Verify SMTP connection configuration
  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
  } catch (verifyError) {
    console.error("SMTP connection verification failed:", verifyError);
    throw verifyError;
  }

  const emailData = {
    from: `${senderHeader} <${process.env.NODEMAILER_EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: content,
  };

  try {
    const info = await transporter.sendMail(emailData);
    console.log("Email sent to:", email);
    console.log("Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    
    // Provide more helpful error debugging
    // if (error.code === 'EAUTH') {
    //   console.error("Authentication error. Please check your email credentials.");
    //   console.error("Make sure you're using an application-specific password if 2FA is enabled.");
    // } else if (error.code === 'ESOCKET') {
    //   console.error("Socket connection error. Check your host and port settings.");
    // } else if (error.code === 'ECONNECTION') {
    //   console.error("Connection error. Check your network and firewall settings.");
    // }
    
    throw error;
  }
};

// Testing function to check email configuration without sending an email
export const testEmailConfig = async () => {
  try {
    // Check required vars
    const requiredVars = [
      'NODEMAILER_HOST', 
      'NODEMAILER_PORT', 
      'NODEMAILER_EMAIL_USER', 
      'NODEMAILER_EMAIL_PASSWORD'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      return { 
        success: false, 
        message: `Missing environment variables: ${missingVars.join(', ')}` 
      };
    }
    
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: Number(process.env.NODEMAILER_PORT),
      secure: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL_USER,
        pass: process.env.NODEMAILER_EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
    
    await transporter.verify();
    
    return { 
      success: true, 
      message: "Email configuration is valid", 
      config: {
        host: process.env.NODEMAILER_HOST,
        port: Number(process.env.NODEMAILER_PORT),
        user: process.env.NODEMAILER_EMAIL_USER,
        // Password omitted for security
      }
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Email configuration test failed:`,
      error: error
    };
  }
};