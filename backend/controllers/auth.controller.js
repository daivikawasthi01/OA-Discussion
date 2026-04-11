const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("../config/mail");

const AppError = require("../config/AppError");
const catchAsync = require("../config/catchAsync");
const logoPath = require("path").join(__dirname, "../../logo.png");

/* ================= HELPERS ================= */

const sendOtp = async (email, otp) => {
  await mailer({
    to: email,
    subject: "Your OaDiscuss OTP Code",
    html: `
      <div style="background:#020617;padding:40px 0;font-family:Inter,Segoe UI,Arial,sans-serif">
        <div style="max-width:520px;margin:auto;background:#020617;border-radius:16px;overflow:hidden;border:1px solid #1e293b">

          <!-- Header -->
          <div style="padding:28px;text-align:center;background:linear-gradient(135deg,#4f46e5,#06b6d4)">
            <img
              src="https://res.cloudinary.com/dhxuhz3uv/image/upload/v1766586567/logo_hhyawr.png"
              alt="OaDiscuss"
              style="height:48px;margin-bottom:12px"
            />
            <h1 style="margin:0;color:white;font-size:22px;font-weight:700">
              OaDiscuss
            </h1>
            <p style="margin-top:6px;color:#e0f2fe;font-size:14px">
              Verify your email to continue
            </p>
          </div>

          <!-- Body -->
          <div style="padding:28px;color:#e5e7eb">
            <p style="margin:0 0 14px;font-size:15px">
              Hey
            </p>

            <p style="margin:0 0 20px;font-size:15px;line-height:1.6">
              Use the OTP below to verify your email on <b>OaDiscuss</b>.
            </p>

            <!-- OTP -->
            <div style="border:2px dashed #38bdf8;border-radius:14px;padding:18px;text-align:center;margin:24px 0">
              <p style="margin:0;font-size:12px;color:#7dd3fc;letter-spacing:1px">
                YOUR OTP CODE
              </p>
              <div style="margin-top:10px;font-size:34px;font-weight:700;letter-spacing:6px;color:#e0f2fe">
                ${otp}
              </div>
            </div>

            <p style="margin:0 0 10px;font-size:14px;color:#cbd5f5">
               This OTP is valid for <b>5 minutes</b>.
            </p>

            <p style="margin:0;font-size:13px;color:#94a3b8">
              If you didn’t request this, you can safely ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding:16px;text-align:center;background:#020617;border-top:1px solid #1e293b">
            <p style="margin:0;font-size:12px;color:#64748b">
              © ${new Date().getFullYear()} OaDiscuss · Learn · Share · Crack OAs
            </p>
          </div>

        </div>
      </div>
    `,
  });
};




const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ================= SIGNUP ================= */

exports.signup = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const exists = await User.findOne({ email });
  if (exists) {
    // 🔐 do NOT reveal account existence
    throw new AppError("Signup failed", 400);
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed });

  const otp = generateOtp();
  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60000),
  });

  await sendOtp(email, otp);

  res.json({ message: "OTP sent" });
});

/* ================= VERIFY OTP ================= */

exports.verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400);
  }

  const record = await Otp.findOne({ email, otp });
  if (!record || record.expiresAt < Date.now()) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await User.updateOne({ email }, { isVerified: true });
  await Otp.deleteMany({ email });

  res.json({ message: "Verified" });
});

/* ================= LOGIN ================= */

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 400);
  }

  // 🚫 Google-only account
  if (user.googleId) {
    throw new AppError(
      "This account uses Google login. Please sign in with Google.",
      400
    );
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email", 400);
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new AppError("Invalid credentials", 400);
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError("Server configuration error", 500);
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    role: user.role,
    userId: user._id.toString(),
    email: user.email,
  });
});


/* ================= FORGOT PASSWORD ================= */

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    // 🔐 prevent email enumeration
    return res.json({ message: "OTP sent" });
  }

  const otp = generateOtp();
  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60000),
  });

  await sendOtp(email, otp);

  res.json({ message: "OTP sent" });
});

/* ================= RESET PASSWORD ================= */

exports.resetPassword = catchAsync(async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    throw new AppError("All fields are required", 400);
  }

  const record = await Otp.findOne({ email, otp });
  if (!record || record.expiresAt < Date.now()) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.updateOne({ email }, { password: hashed });
  await Otp.deleteMany({ email });

  res.json({ message: "Password reset successful" });
});
