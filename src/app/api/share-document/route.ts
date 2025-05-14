/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();
    const { email, documentName, documentUrl, message } = body;

    if (!email  || !documentUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Configure nodemailer transporter with your environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST ,
      port: Number(process.env.NODEMAILER_PORT) || 465,
      secure: false, // Port 465 requires secure connection
      auth: {
        user: process.env.NODEMAILER_EMAIL_USER ,
        pass: process.env.NODEMAILER_EMAIL_PASSWORD ,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL_USER,
      to: email,
      subject: `Document Shared: ${documentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #333;">Document Shared</h2>
          <p>${message || "A document has been shared with you."}</p>
          <p>Document: <strong>${documentName}</strong></p>
          <div style="margin: 30px 0;">
            <a href="${documentUrl}" 
               style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              View Document
            </a>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            This email was sent automatically. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
