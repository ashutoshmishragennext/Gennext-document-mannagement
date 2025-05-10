import nodemailer from "nodemailer";

export const sendEmail = async (
  senderHeader: string,
  email: string,
  subject: string,
  content: string
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: Number(process.env.NODEMAILER_PORT),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.NODEMAILER_EMAIL_USER,
      pass: process.env.NODEMAILER_EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
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
    throw error;
  }
};
