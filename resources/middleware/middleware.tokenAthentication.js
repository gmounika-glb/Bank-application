import jwt from 'jsonwebtoken';
import ManagerModel from '../../manager/manager.model.js';
import CustomerModel from '../../customer/customer.model.js';
import config from 'config';

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({message: 'No token, authorization denied'});
  }
  try {
    const decoded = jwt.verify(token, config.get('jwt-token.jwt-password'));
    let user = await ManagerModel.findById(decoded.userId);
    if (user) {
      req.user = user;
      req.userType = 'manager';
      return next();
    }
    user = await CustomerModel.findById(decoded.userId);
    if (user) {
      req.user = user;
      req.userType = 'customer';
      return next();
    }
    return res.status(401).json({message: 'User not found'});
  } catch (err) {
    return res.status(401).json({message: 'Token is not valid or expired'});
  }
};

export default authMiddleware;
