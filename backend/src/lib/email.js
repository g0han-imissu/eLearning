import nodemailer from "nodemailer";
import { emailUser, emailPass, emailHost, emailPort } from "../config/env.js";

// Email chỉ hoạt động khi đã điền EMAIL_USER + EMAIL_PASS thật trong .env
export const isEmailConfigured = () =>
  Boolean(emailUser && emailPass) &&
  ![emailUser, emailPass].some((v) => String(v).toLowerCase().startsWith("your"));

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

const assertConfigured = () => {
  if (!isEmailConfigured()) {
    throw new Error(
      "Email chưa được cấu hình: điền EMAIL_USER và EMAIL_PASS (Gmail App Password) trong backend/.env"
    );
  }
};

export const sendVerificationEmail = async ({ to, verifyUrl }) => {
  assertConfigured();
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

export const sendOrgApprovedEmail = async ({ to, orgName, orgCode, contactName, activateUrl }) => {
  assertConfigured();
  await transporter.sendMail({
    from: `"LMS System" <${emailUser}>`,
    to,
    subject: `Yêu cầu đăng ký của ${orgName} đã được duyệt`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #333;">Chúc mừng ${contactName}!</h2>
        <p>Yêu cầu đăng ký sử dụng LMS cho <strong>${orgName}</strong> đã được phê duyệt.</p>
        ${orgCode ? `<p>Mã tổ chức của bạn: <strong style="font-size:18px;color:#4f46e5;">${orgCode}</strong> — dùng làm tiền tố tên đăng nhập khi tạo tài khoản cho giảng viên/sinh viên.</p>` : ""}
        <p>Tài khoản Quản trị viên tổ chức đã được tạo với email này. Nhấn nút bên dưới để đặt mật khẩu và kích hoạt tài khoản:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${activateUrl}" style="
            background: #4f46e5;
            color: #fff;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
          ">Kích hoạt tài khoản</a>
        </div>
        <p style="color: #888; font-size: 13px;">Liên kết có hiệu lực trong <strong>72 giờ</strong>.</p>
      </div>
    `,
  });
};

export const sendOrgRejectedEmail = async ({ to, orgName, contactName, reason }) => {
  assertConfigured();
  await transporter.sendMail({
    from: `"LMS System" <${emailUser}>`,
    to,
    subject: `Yêu cầu đăng ký của ${orgName} không được duyệt`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #333;">Xin chào ${contactName},</h2>
        <p>Rất tiếc, yêu cầu đăng ký sử dụng LMS cho <strong>${orgName}</strong> chưa được phê duyệt.</p>
        ${reason ? `<p><strong>Lý do:</strong> ${reason}</p>` : ""}
        <p style="color: #888; font-size: 13px;">Bạn có thể gửi lại yêu cầu sau khi bổ sung thông tin, hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
      </div>
    `,
  });
};

export const sendUserInviteEmail = async ({ to, fullName, orgName, username, activateUrl }) => {
  assertConfigured();
  await transporter.sendMail({
    from: `"LMS System" <${emailUser}>`,
    to,
    subject: `Tài khoản LMS của bạn tại ${orgName} đã được tạo`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #333;">Xin chào ${fullName},</h2>
        <p><strong>${orgName}</strong> đã tạo tài khoản LMS cho bạn.</p>
        ${username ? `<p>Tên đăng nhập: <strong>${username}</strong> (hoặc dùng chính email này)</p>` : ""}
        <p>Nhấn nút bên dưới để đặt mật khẩu và kích hoạt tài khoản:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${activateUrl}" style="
            background: #4f46e5;
            color: #fff;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
          ">Kích hoạt tài khoản</a>
        </div>
        <p style="color: #888; font-size: 13px;">Liên kết có hiệu lực trong <strong>72 giờ</strong>.</p>
      </div>
    `,
  });
};

export const sendOtpEmail = async ({ to, otp }) => {
  assertConfigured();
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
