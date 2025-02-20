import express from 'express';
import ManagerController from './manager.controller.js';
import authMiddleware from '../resources/middleware/middleware.tokenAthentication.js';

const router = express.Router();
router.post('/create', ManagerController.create);
router.post('/verify-otp', ManagerController.verifyOtp);
router.post('/login', ManagerController.login);
router.get('/customers', ManagerController.getAllCustomers);
router.get('/', ManagerController.getAllManagers);
router.put(
  '/update-status',
  authMiddleware,
  ManagerController.updateCustomerStatus
);
router.get(
  '/manager/get-inactive-customers',
  authMiddleware,
  ManagerController.getAllInactiveCustomers
);

export default router;
