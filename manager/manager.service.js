import Response from '../resources/response/response.response.js';
import logger from '../resources/logs/logger.log.js';
import ManagerValidation from './manager.validation.js';
import ManagerModel from './manager.model.js';
import CustomerModel from '../customer/customer.model.js';
import {
  sendOtpEmail,
  sendStatusChangeNotification,
} from '../resources/nodeMail/nodeMail.nodeMailer.js';
import jwt from 'jsonwebtoken';
import config from 'config';
class ManagerService {
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
  }
  async create(req, res) {
    try {
      const data = req.body;
      const {value, error} = ManagerValidation.createManager(data);
      if (error) {
        logger.error('Validation failed: ', error);
        return res
          .status(400)
          .send(Response.validationFailResp('VALIDATION_FAIL', error.details));
      }
      const isManagerExist = await ManagerModel.findOne({
        emailId: value.emailId,
      });
      if (isManagerExist) {
        logger.warn(`Manager with email ${value.emailId} already exists.`);
        return res
          .status(409)
          .send(Response.failResp('Manager email already exists.'));
      }
      const newManager = new ManagerModel(data);
      const otp = newManager.generateOtp();
      await newManager.save();
      await sendOtpEmail(value.emailId, otp);
      return res.status(201).send(
        Response.successResp(
          'Manager created successfully. OTP sent to email.',
          {
            otp: otp,
          }
        )
      );
    } catch (err) {
      logger.error('Error creating manager: ', err);
      return res
        .status(500)
        .send(
          Response.failResp(
            'Failed to create manager. Please try again later.',
            err
          )
        );
    }
  }
  async verifyOtp(req, res) {
    try {
      const {emailId, otp} = req.body;
      const manager = await ManagerModel.findOne({emailId});
      if (!manager) {
        return res.status(404).send(Response.failResp('Manager not found.'));
      }
      if (manager.otpExpiresAt && new Date() > manager.otpExpiresAt) {
        manager.otp = null;
        manager.otpExpiresAt = null;
        manager.otpAttempts = 0;
        const newOtp = manager.generateOtp();
        await sendOtpEmail(manager.emailId, newOtp);
        await manager.save();
        return res
          .status(400)
          .send(
            Response.failResp(
              'OTP expired. A new OTP has been sent to your email.'
            )
          );
      }
      if (manager.otpAttempts >= 3) {
        manager.otpAttempts = 0;
        const newOtp = manager.generateOtp();
        await sendOtpEmail(manager.emailId, newOtp);
        await manager.save();
        return res
          .status(400)
          .send(
            Response.failResp(
              'Maximum OTP attempts exceeded. Please check your email for a new OTP.'
            )
          );
      }
      if (manager.otp === otp) {
        manager.otp = null;
        manager.otpExpiresAt = null;
        manager.otpAttempts = 0;
        manager.otpVerified = true;
        await manager.save();
        return res.status(200).send(
          Response.successResp(
            'OTP verified successfully. Manager details fetched.',
            {
              manager,
            }
          )
        );
      } else {
        manager.otpAttempts += 1;
        await manager.save();
        return res
          .status(400)
          .send(
            Response.failResp(
              `Invalid OTP. Attempts remaining: ${3 - manager.otpAttempts}`
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
      const {emailId, password, fullName} = req.body;
      let manager;
      if (emailId) {
        manager = await ManagerModel.findOne({emailId});
      } else if (fullName) {
        manager = await ManagerModel.findOne({fullName});
      } else {
        return res
          .status(400)
          .send(
            Response.failResp('Either emailId or fullName must be provided.')
          );
      }
      if (!manager) {
        return res.status(404).send(Response.failResp('Manager not found.'));
      }
      const isMatch = await manager.matchPassword(password);
      if (!isMatch) {
        return res.status(400).send(Response.failResp('Invalid password.'));
      }
      if (!manager.otpVerified) {
        return res.status(400).send(Response.failResp('OTP not verified.'));
      }
      const token = jwt.sign(
        {userId: manager._id},
        config.get('jwt-token.jwt-password'),
        {expiresIn: '1h'}
      );
      return res.status(200).send(
        Response.successResp('Login successful.', {
          manager,
          token,
        })
      );
    } catch (err) {
      console.error('Error logging in: ', err);
      return res
        .status(500)
        .send(
          Response.failResp('Failed to log in. Please try again later.', err)
        );
    }
  }
  async getAllCustomers(req, res) {
    try {
      const {customerName, accountNumber, emailId} = req.query;
      let filter = {};
      if (customerName) {
        filter.customerName = {$regex: customerName, $options: 'i'};
      }
      if (accountNumber) {
        filter.accountNumber = accountNumber;
      }
      if (emailId) {
        filter.emailId = {$regex: emailId, $options: 'i'};
      }
      const customers = await CustomerModel.find(filter);
      return res
        .status(200)
        .send(
          Response.successResp('All customers fetched successfully.', customers)
        );
    } catch (err) {
      logger.error('Error fetching customers: ', err);
      return res
        .status(500)
        .send(
          Response.failResp(
            'Failed to fetch customers. Please try again later.',
            err
          )
        );
    }
  }
  async getAllManagers(req, res) {
    try {
      const managers = await ManagerModel.find();
      return res
        .status(200)
        .send(Response.successResp('Managers fetched successfully.', managers));
    } catch (err) {
      logger.error('Error fetching managers: ', err);
      return res
        .status(500)
        .send(
          Response.failResp(
            'Failed to fetch managers. Please try again later.',
            err
          )
        );
    }
  }
  async updateCustomerStatus(req, res) {
    const {accountNumber, customerName, emailId, startDate, endDate, status} =
      req.body;
    const managerFullName = req.user.fullName;
    if (!managerFullName) {
      return res
        .status(400)
        .send(Response.failResp('Manager information not found.'));
    }
    let filter = {};
    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res
        .status(400)
        .send(
          Response.failResp(
            'Invalid status value. Please provide "Active" or "Inactive" status.'
          )
        );
    }
    if (accountNumber) {
      filter.accountNumber = accountNumber;
    }
    if (customerName) {
      filter.customerName = {$regex: customerName, $options: 'i'};
    }
    if (emailId) {
      filter.emailId = {$regex: emailId, $options: 'i'};
    }
    if (startDate) {
      filter.createdAt = {$gte: new Date(startDate)};
    }
    if (endDate) {
      filter.createdAt = {$lte: new Date(endDate)};
    }
    try {
      const customers = await CustomerModel.find(filter);
      if (customers.length === 0) {
        return res
          .status(404)
          .send(Response.failResp('No customers found matching the criteria.'));
      }
      const updatedCustomers = await Promise.all(
        customers.map(async customer => {
          const oldStatus = customer.status;
          customer.status = status;
          await customer.save();
          if (oldStatus !== status) {
            const currentDateTime = new Date().toLocaleString(); // Get the current date and time
            await sendStatusChangeNotification(
              customer.emailId,
              status,
              managerFullName,
              currentDateTime
            );
          }
          return customer;
        })
      );
      return res
        .status(200)
        .send(
          Response.successResp(
            'Customer statuses updated successfully.',
            updatedCustomers
          )
        );
    } catch (err) {
      logger.error('Error updating customer statuses: ', err);
      return res
        .status(500)
        .send(
          Response.failResp(
            'Failed to update customer statuses. Please try again later.',
            err
          )
        );
    }
  }
  async getAllInactiveCustomers(req, res) {
    try {
      const customers = await CustomerModel.find({status: 'Inactive'});
      if (customers.length === 0) {
        return res
          .status(404)
          .send(Response.failResp('No inactive customer accounts found.'));
      }
      return res
        .status(200)
        .send(
          Response.successResp(
            'Inactive customer accounts fetched successfully.',
            customers
          )
        );
    } catch (err) {
      logger.error('Error fetching inactive customers: ', err);
      return res
        .status(500)
        .send(
          Response.failResp(
            'Failed to fetch inactive customers. Please try again later.',
            err
          )
        );
    }
  }
  async getAllActiveCustomers(req, res) {
    try {
      const customers = await CustomerModel.find({status: 'Active'});
      if (customers.length === 0) {
        return res
          .status(404)
          .send(Response.failResp('No Active customer accounts found.'));
      }
      return res
        .status(200)
        .send(
          Response.successResp(
            'Active customer accounts fetched successfully.',
            customers
          )
        );
    } catch (err) {
      logger.error('Error fetching inactive customers: ', err);
      return res
        .status(500)
        .send(
          Response.failResp(
            'Failed to fetch Active customers. Please try again later.',
            err
          )
        );
    }
  }
}
export default new ManagerService();
