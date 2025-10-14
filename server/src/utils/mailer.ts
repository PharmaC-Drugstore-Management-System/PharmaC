import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const googleMailer = {
  // Function to send OTP email
  sendOtp: async (to : any, otp : any) => {
    try {
      const accessToken = await oAuth2Client.getAccessToken();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.GOOGLE_SENDER_MAIL,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      });

     const mailOptions = {
        from: `PharmaC Security <${process.env.GOOGLE_SENDER_MAIL}>`,
        to,
        subject: "Your PharmaC Verification Code",
        text: `Your verification code is: ${otp}. This code is valid for 5 minutes. If you did not request this, please ignore this email.`, // Fallback for non-HTML clients
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0d9488; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">PharmaC Verification</h1>
            </div>
            <div style="padding: 30px 20px;">
              <h2 style="color: #0d9488; font-size: 20px;">Your One-Time Password</h2>
              <p>Hello,</p>
              <p>Please use the following verification code to complete your action. This code is valid for the next <strong>5 minutes</strong>.</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 4px; color: #111827; background-color: #f3f4f6; padding: 15px 30px; border-radius: 8px; border: 1px dashed #ccc;">
                  ${otp}
                </span>
              </div>
              <p>If you did not request this code, you can safely ignore this email. Your account is secure.</p>
              <p>Thank you,<br/>The PharmaC Team</p>
            </div>
            <div style="background-color: #f8f9fa; color: #6c757d; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2025 PharmaC. All rights reserved.</p>
              <p style="margin: 0;">This is an automated message. Please do not reply.</p>
            </div>
          </div>
        `,
      };

      const result = await transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error("Error sending OTP email:", error);
      throw new Error("Failed to send OTP email");
    }
  },
};

export default googleMailer;