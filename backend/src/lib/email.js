import nodemailer from "nodemailer";
import { emailUser, emailPass, emailHost, emailPort } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const sendVerificationEmail = async ({ to, verifyUrl }) => {
  await transporter.sendMail({
    from: `"LMS System" <${emailUser}>`,
    to,
    subject: "Xác nhận tài khoản LMS",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #333;">Chào mừng đến với LMS!</h2>
        <p>Nhấn vào nút bên dưới để xác nhận email và kích hoạt tài khoản của bạn:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="
            background: #4f46e5;
            color: #fff;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
          ">Xác nhận tài khoản</a>
        </div>
        <p style="color: #888; font-size: 13px;">Liên kết có hiệu lực trong <strong>24 giờ</strong>.</p>
        <p style="color: #888; font-size: 13px;">Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.</p>
      </div>
    `,
  });
};

export const sendOtpEmail = async ({ to, otp }) => {
  await transporter.sendMail({
    from: `"LMS System" <${emailUser}>`,
    to,
    subject: "Mã xác nhận đổi mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #333;">Xác nhận đổi mật khẩu</h2>
        <p>Bạn đã yêu cầu đổi mật khẩu. Nhập mã OTP bên dưới để xác nhận:</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          text-align: center;
          background: #f4f4f4;
          padding: 20px;
          border-radius: 8px;
          margin: 24px 0;
          color: #1a73e8;
        ">${otp}</div>
        <p>Mã có hiệu lực trong <strong>10 phút</strong>.</p>
        <p style="color: #888; font-size: 13px;">
          Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
        </p>
      </div>
    `,
  });
};
