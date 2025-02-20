import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const MAX_ATTEMPTS = 3;
const managerSchema = new mongoose.Schema(
  {
    fullName: {type: String, required: true},
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {type: String, required: true},
    role: {type: String, default: 'Manager'},
    otp: {type: String},
    otpExpiresAt: {type: Date},
    otpAttempts: {type: Number, default: 0},
    otpVerified: {type: Boolean, default: false},
  },
  {timestamps: true}
);

managerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});
managerSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
managerSchema.methods.generateOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = 5 * 60 * 1000;
  const otpExpiresAt = new Date(Date.now() + expirationTime);
  this.otp = otp;
  this.otpExpiresAt = otpExpiresAt;
  this.otpAttempts = 0;
  return otp;
};
managerSchema.methods.verifyOtp = function (otp) {
  if (this.otpAttempts >= MAX_ATTEMPTS) {
    return {success: false, message: 'Maximum OTP attempts exceeded.'};
  }
  if (new Date() > this.otpExpiresAt) {
    this.otp = null;
    this.otpExpiresAt = null;
    this.otpAttempts = 0;
    this.otpVerified = false;
    return {success: false, message: 'OTP has expired.'};
  }
  if (this.otp === otp) {
    this.otp = null;
    this.otpExpiresAt = null;
    this.otpAttempts = 0;
    this.otpVerified = true;
    return {success: true, message: 'OTP verified successfully.'};
  }
  this.otpAttempts += 1;
  return {
    success: false,
    message: `Invalid OTP. Attempts remaining: ${
      MAX_ATTEMPTS - this.otpAttempts
    }`,
  };
};
const Manager = mongoose.model('Manager', managerSchema);
export default Manager;
