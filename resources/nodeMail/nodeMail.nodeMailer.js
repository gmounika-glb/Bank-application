import nodemailer from 'nodemailer';
import config from 'config';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.get('nodemailer.email_user'),
    pass: config.get('nodemailer.email_password'),
  },
});
export const sendOtpEmail = async (emailId, otp) => {
  try {
    const mailOptions = {
      from: config.get('nodemailer.email_user'),
      to: emailId,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${emailId}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};
export const sendWithdrawalNotification = async (emailId, amount) => {
  try {
    const mailOptions = {
      from: config.get('nodemailer.email_user'),
      to: emailId,
      subject: 'Account Withdrawal Notification',
      text: `You have successfully withdrawn ₹${amount} from your account on ${new Date()}. Your remaining balance is updated.`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Withdrawal notification sent to ${emailId}`);
  } catch (error) {
    console.error('Error sending withdrawal notification email:', error);
    throw new Error('Failed to send withdrawal notification email');
  }
};
export const sendTransactionNotification = async (emailId, amount, type) => {
  try {
    const transactionType = type === 'sent' ? 'sent' : 'received';
    const mailOptions = {
      from: config.get('nodemailer.email_user'),
      to: emailId,
      subject: `Account Transaction ${transactionType} Notification`,
      text: `You have ${transactionType} ₹${amount} on ${new Date()}. Your balance is updated.`,
    };
    await transporter.sendMail(mailOptions);
    console.log(
      `Transaction ${transactionType} notification sent to ${emailId}`
    );
  } catch (error) {
    console.error('Error sending transaction notification email:', error);
    throw new Error('Failed to send transaction notification email');
  }
};
export const sendStatusChangeNotification = async (
  emailId,
  newStatus,
  managerFullName,
  dateTime
) => {
  try {
    const mailOptions = {
      from: config.get('nodemailer.email_user'),
      to: emailId,
      subject: 'Your Account Status Has Changed',
      text: `Dear Customer,

We would like to inform you that your account status has been updated to "${newStatus}".

This change was made by manager ${managerFullName} on ${dateTime}.

If you have any questions, feel free to contact us.

Best regards,
Your Bank Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Status change notification sent to ${emailId}`);
  } catch (error) {
    console.error('Error sending status change notification email:', error);
    throw new Error('Failed to send status change notification email');
  }
};
