import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MAX_ATTEMPTS = 3;

const transactionSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    enum: ['Deposit', 'Withdrawal'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Fail'],
    default: 'Pending',
  },
});

const customerSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    accountType: {
      type: String,
      enum: ['Savings', 'Current'],
      required: true,
    },
    phoneNumber: {type: Number},
    customerName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {type: String, required: true},
    balance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Inactive',
    },
    transactions: [transactionSchema],
    otp: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    amount: {
      type: Number,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpVerified: {type: Boolean, default: false},
  },
  {timestamps: true}
);

customerSchema.pre('save', async function (next) {
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

customerSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

customerSchema.methods.generateOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = 5 * 60 * 1000;
  const otpExpiresAt = new Date(Date.now() + expirationTime);
  this.otp = otp;
  this.otpExpiresAt = otpExpiresAt;
  this.otpAttempts = 0;
  return otp;
};

customerSchema.methods.verifyOtpAndPassword = async function (otp, password) {
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

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
