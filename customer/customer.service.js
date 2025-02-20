import customerModel from './customer.model.js';
import Response from '../resources/response/response.response.js';
import logger from '../resources/logs/logger.log.js';
import {
  sendOtpEmail,
  sendWithdrawalNotification,
  sendTransactionNotification,
} from '../resources/nodeMail/nodeMail.nodeMailer.js';
import jwt from 'jsonwebtoken';
import config from 'config';
import CustomerValidation from './customer.validation.js';
class CustomerService {
  generateAccountNumber() {
    return Math.floor(100000000000 + Math.random() * 900000000000);
  }
  generateAndSendOtp(emailId) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    sendOtpEmail(emailId, otp);
    return otp;
  }
  async createAccount(req, res) {
    try {
      const {error} = CustomerValidation.createCustomer(req.body);
      if (error) {
        return res
          .status(400)
          .send(Response.failResp(error.details[0].message));
      }
      const {
        accountType,
        customerName,
        emailId,
        password,
        phoneNumber,
        initialDeposit,
      } = req.body;
      const existingCustomer = await customerModel.findOne({
        emailId: {$regex: new RegExp('^' + emailId + '$', 'i')},
      });
      if (existingCustomer) {
        return res
          .status(400)
          .send(Response.failResp('EmailId already exists.'));
      }
      const accountNumber = this.generateAccountNumber();
      const otp = this.generateAndSendOtp(emailId);
      const customer = new customerModel({
        accountNumber,
        accountType,
        customerName,
        emailId,
        phoneNumber,
        password,
        balance: initialDeposit || 0,
        status: 'Inactive',
        otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        otpAttempts: 0,
      });
      await customer.save();
      return res.status(200).send(
        Response.successResp('OTP sent to your emailId. Please verify.', {
          otp,
        })
      );
    } catch (err) {
      if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        return res
          .status(400)
          .send(Response.failResp('EmailId already exists.'));
      }
      logger.error('Error creating account: ', err);
      return res
        .status(500)
        .send(
          Response.failResp(
            'Failed to create account. Please try again later.',
            err
          )
        );
    }
  }
  async verifyOtp(req, res) {
    try {
      const {emailId, otp} = req.body;
      const customer = await customerModel.findOne({emailId: emailId});
      if (!customer) {
        return res.status(404).send(Response.failResp('Customer not found.'));
      }
      if (customer.otpExpiresAt && new Date() > customer.otpExpiresAt) {
        customer.otpVerified = false;
        customer.otp = null;
        customer.otpExpiresAt = null;
        customer.otpAttempts = 0;
        const newOtp = this.generateAndSendOtp(customer.emailId);
        customer.otp = newOtp;
        customer.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await customer.save();
        return res
          .status(400)
          .send(
            Response.failResp(
              'OTP expired. A new OTP has been sent to your emailId.'
            )
          );
      }
      if (customer.otpAttempts >= 3) {
        customer.otpAttempts = 0;
        const newOtp = this.generateAndSendOtp(customer.emailId);
        customer.otp = newOtp;
        customer.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await customer.save();
        return res
          .status(400)
          .send(
            Response.failResp(
              'Maximum OTP attempts exceeded. Please check your emailId for a new OTP.'
            )
          );
      }
      if (customer.otp === otp) {
        customer.otpVerified = true;
        customer.otp = null;
        customer.otpExpiresAt = null;
        customer.otpAttempts = 0;
        await customer.save();
        return res
          .status(200)
          .send(
            Response.successResp(
              'OTP verified successfully. Your account is now active.',
              {customer}
            )
          );
      } else {
        customer.otpAttempts += 1;
        await customer.save();
        return res
          .status(400)
          .send(
            Response.failResp(
              `Invalid OTP. Attempts remaining: ${3 - customer.otpAttempts}`
            )
          );
      }
    } catch (err) {
      logger.error('Error verifying OTP: ', err);
      return res
        .status(500)
        .send(
          Response.failResp(
            'Failed to verify OTP. Please try again later.',
            err
          )
        );
    }
  }
  async login(req, res) {
    try {
      const {identifier, password} = req.body;
      let query = {};
      if (/\S+@\S+\.\S+/.test(identifier)) {
        query.emailId = identifier;
      } else if (!isNaN(identifier)) {
        query.accountNumber = identifier;
      } else if (typeof identifier === 'string') {
        query.customerName = identifier;
      } else {
        query._id = identifier;
      }
      const customer = await customerModel.findOne(query);
      if (!customer) {
        return res.status(404).send(Response.failResp('Customer not found.'));
      }
      const isPasswordValid = await customer.matchPassword(password);
      if (!isPasswordValid) {
        return res.status(400).send(Response.failResp('Invalid password.'));
      }
      const userDetails = {
        accountType: customer.accountType,
        customerName: customer.customerName,
        accountNumber: customer.accountNumber,
        emailId: customer.emailId,
        status: customer.status,
        otpVerified: customer.otpVerified || false,
      };
      const token = jwt.sign(
        {userId: customer._id},
        config.get('jwt-token.jwt-password'),
        {expiresIn: '1h'}
      );
      if (customer.status === 'Active') {
        return res
          .status(200)
          .send(
            Response.successResp('Login successful', {...userDetails, token})
          );
      }
      return res.status(200).send(
        Response.successResp('Login successful. Account is inactive.', {
          ...userDetails,
          token,
        })
      );
    } catch (err) {
      logger.error('Error during login: ', err);
      return res
        .status(500)
        .send(
          Response.failResp('Failed to log in. Please try again later.', err)
        );
    }
  }
  async getAccountDetails(req, res) {
    try {
      const {accountNumber} = req.query;
      const account = await customerModel.findOne({accountNumber});
      if (!account) {
        return res.status(404).send(Response.failResp('Account not found.'));
      }
      if (account.status !== 'Active') {
        return res
          .status(400)
          .send(
            Response.failResp(
              'Account is not active. Please contact the manager.'
            )
          );
      }
      return res.status(200).send(
        Response.successResp('Account details fetched successfully.', {
          account,
        })
      );
    } catch (err) {
      logger.error('Error fetching account details: ', err);
      return res
        .status(500)
        .send(
          Response.failResp(
            'Failed to fetch account details. Please try again later.',
            err
          )
        );
    }
  }
  async getAccountBalance(req, res) {
    const accountNumber = req.query;
    try {
      const customer = await customerModel.findOne(accountNumber);
      if (!customer) {
        return res
          .status(404)
          .send({status: 'fail', message: 'Customer not found'});
      }
      return res
        .status(200)
        .send({status: 'success', balance: customer.balance});
    } catch (err) {
      return res.status(500).send({
        status: 'fail',
        message: 'An error occurred while fetching balance.',
      });
    }
  }
  async makeTransaction(req, res) {
    const {senderAccountNumber, receiverAccountNumber, amount} = req.body;
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).send({
        status: 'fail',
        message: 'Amount should be a valid positive number.',
      });
    }
    try {
      const sender = await customerModel.findOne({
        accountNumber: senderAccountNumber,
      });
      const receiver = await customerModel.findOne({
        accountNumber: receiverAccountNumber,
      });
      if (!sender || !receiver) {
        return res.status(404).send({
          status: 'fail',
          message: 'One or both accounts not found.',
        });
      }
      if (sender.balance < amount) {
        return res.status(400).send({
          status: 'fail',
          message: 'Insufficient funds for the transaction.',
        });
      }
      const senderTransaction = {
        transactionType: 'Withdrawal',
        amount: amount,
        status: 'Pending',
        date: new Date(),
      };
      const receiverTransaction = {
        transactionType: 'Deposit',
        amount: amount,
        status: 'Pending',
        date: new Date(),
      };
      sender.balance -= amount;
      receiver.balance += amount;
      sender.transactions.push(senderTransaction);
      receiver.transactions.push(receiverTransaction);
      await sender.save();
      await receiver.save();
      const senderTransactionIndex = sender.transactions.findIndex(
        t => t.status === 'Pending' && t.amount === amount
      );
      const receiverTransactionIndex = receiver.transactions.findIndex(
        t => t.status === 'Pending' && t.amount === amount
      );
      if (senderTransactionIndex !== -1) {
        sender.transactions[senderTransactionIndex].status = 'Success';
      }
      if (receiverTransactionIndex !== -1) {
        receiver.transactions[receiverTransactionIndex].status = 'Success';
      }
      await sender.save();
      await receiver.save();
      await sendTransactionNotification(sender.emailId, amount, 'sent');
      await sendTransactionNotification(receiver.emailId, amount, 'received');
      return res.status(200).send({
        status: 'success',
        message: 'Transaction successful',
        senderBalance: sender.balance,
        receiverBalance: receiver.balance,
      });
    } catch (err) {
      console.error('Error processing transaction: ', err);
      const senderTransactionIndex = sender.transactions.findIndex(
        t => t.status === 'Pending' && t.amount === amount
      );
      const receiverTransactionIndex = receiver.transactions.findIndex(
        t => t.status === 'Pending' && t.amount === amount
      );
      if (senderTransactionIndex !== -1) {
        sender.transactions[senderTransactionIndex].status = 'Failed';
      }
      if (receiverTransactionIndex !== -1) {
        receiver.transactions[receiverTransactionIndex].status = 'Failed';
      }
      await sender.save();
      await receiver.save();
      return res.status(500).send({
        status: 'fail',
        message: 'An error occurred during the transaction.',
      });
    }
  }
  async withdrawFunds(req, res) {
    const {accountNumber, amount} = req.body;
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).send({
        status: 'fail',
        message: 'Amount should be a valid positive number.',
      });
    }
    try {
      const customer = await customerModel.findOne({accountNumber});
      if (!customer) {
        return res.status(404).send({
          status: 'fail',
          message: 'Customer not found.',
        });
      }
      if (customer.status === 'Inactive') {
        return res.status(400).send({
          status: 'fail',
          message: 'Account is inactive.',
        });
      }
      let withdrawalLimit = 0;
      let withdrawalsToday = customer.withdrawalsToday || 0;
      if (customer.accountType === 'Savings') {
        withdrawalLimit = 50000;
      } else if (customer.accountType === 'Current') {
        withdrawalLimit = 100000;
      }
      if (withdrawalsToday + amount > withdrawalLimit) {
        return res.status(400).send({
          status: 'fail',
          message: `Withdrawal amount exceeds the daily limit of ${withdrawalLimit}.`,
        });
      }
      if (customer.balance < amount) {
        return res.status(400).send({
          status: 'fail',
          message: 'Insufficient funds.',
        });
      }
      customer.balance -= amount;
      customer.withdrawalsToday += amount;
      const transaction = {
        transactionType: 'Withdrawal',
        amount: amount,
        status: 'Pending',
        date: new Date(),
      };
      customer.transactions.push(transaction);
      await customer.save();
      const transactionIndex = customer.transactions.findIndex(
        t => t.amount === amount && t.status === 'Pending'
      );
      if (transactionIndex !== -1) {
        customer.transactions[transactionIndex].status = 'Success';
      }
      await customer.save();
      await sendWithdrawalNotification(customer.emailId, amount);
      return res.status(200).send({
        status: 'success',
        message: 'Withdrawal successful',
        balance: customer.balance,
      });
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      return res.status(500).send({
        status: 'fail',
        message: 'An error occurred while processing the withdrawal.',
      });
    }
  }
  async getTransactionHistory(req, res) {
    const {
      accountNumber,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      amount,
      transactionType,
      status,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    try {
      // Validate the incoming query parameters
      const {error} = CustomerValidation.getTransactionHistory(req.query);
      if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({
          status: 'fail',
          message: 'Validation failed',
          errors: errorMessages,
        });
      }

      const customer = await customerModel.findOne({accountNumber});
      if (!customer) {
        return res
          .status(404)
          .json({status: 'fail', message: 'Customer not found'});
      }

      let filters = {};

      // Apply date filters
      if (startDate || endDate) {
        let start = startDate ? new Date(startDate).toISOString() : null;
        let end = endDate ? new Date(endDate).toISOString() : null;
        if (start && end) {
          filters['transactions.date'] = {$gte: start, $lte: end};
        } else if (start) {
          filters['transactions.date'] = {$gte: start};
        } else if (end) {
          filters['transactions.date'] = {$lte: end};
        }
      }

      // Apply amount filters
      if (minAmount || maxAmount) {
        filters['transactions.amount'] = {};
        if (minAmount) {
          filters['transactions.amount'].$gte = minAmount;
        }
        if (maxAmount) {
          filters['transactions.amount'].$lte = maxAmount;
        }
      }

      // Apply amount filter (specific amount)
      if (amount) {
        filters['transactions.amount'] = filters['transactions.amount'] || {};
        filters['transactions.amount'].$eq = amount;
      }

      // Apply transactionType filter
      if (transactionType) {
        filters['transactions.transactionType'] = transactionType;
      }

      // Apply status filter
      if (status) {
        filters['transactions.status'] = status;
      }

      // Filter transactions based on the provided filters
      let transactions = customer.transactions.filter(transaction => {
        let match = true;
        if (filters['transactions.date']) {
          if (
            filters['transactions.date'].$gte &&
            new Date(transaction.date).toISOString() <
              filters['transactions.date'].$gte
          ) {
            match = false;
          }
          if (
            filters['transactions.date'].$lte &&
            new Date(transaction.date).toISOString() >
              filters['transactions.date'].$lte
          ) {
            match = false;
          }
        }
        if (
          filters['transactions.transactionType'] &&
          transaction.transactionType !==
            filters['transactions.transactionType']
        ) {
          match = false;
        }
        if (filters['transactions.amount']) {
          if (
            filters['transactions.amount'].$gte &&
            transaction.amount < filters['transactions.amount'].$gte
          ) {
            match = false;
          }
          if (
            filters['transactions.amount'].$lte &&
            transaction.amount > filters['transactions.amount'].$lte
          ) {
            match = false;
          }
          if (
            filters['transactions.amount'].$eq &&
            transaction.amount !== filters['transactions.amount'].$eq
          ) {
            match = false;
          }
        }
        if (
          filters['transactions.status'] &&
          transaction.status !== filters['transactions.status']
        ) {
          match = false;
        }

        return match;
      });

      // Sort transactions
      if (sortBy === 'amount') {
        transactions.sort((a, b) => {
          return sortOrder === 'asc'
            ? a.amount - b.amount
            : b.amount - a.amount;
        });
      } else {
        transactions.sort((a, b) => {
          return sortOrder === 'asc'
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        });
      }

      if (transactions.length === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'No transactions found for the given filters',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Transaction history fetched successfully.',
        transactions,
      });
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      return res.status(500).json({
        status: 'fail',
        message: 'An error occurred while fetching transaction history.',
      });
    }
  }
}
export default new CustomerService();
