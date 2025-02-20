import express from 'express';
import CustomerController from './customer.controller.js';
const router = express.Router();
router.post('/create', CustomerController.createAccount);
router.post('/verify-otp', CustomerController.verifyOtp);
router.post('/login', CustomerController.login);
router.get(
  '/accountDetails/:accountNumber',
  CustomerController.getAccountDetails
);
router.get('/balance/:accountNumber', CustomerController.getAccountBalance);
router.post('/deposit', CustomerController.makeTransaction);
router.post('/withdraw', CustomerController.withdrawFunds);
router.get('/transaction-history', CustomerController.getTransactionHistory);
export default router;
