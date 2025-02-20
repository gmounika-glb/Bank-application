import ManagerService from './manager.service.js';
class ManagerController {
  async create(req, res, next) {
    /* #swagger.tags = ['Manager']
       #swagger.description = 'This route is used to create a Manager' */
    /* #swagger.parameters['data'] = {
        in: 'body',
        description: 'Manager Details',
        required: true,
        schema: { $ref: "#/definitions/CreateManager" }
    } */

    return await ManagerService.create(req, res, next);
  }
  async verifyOtp(req, res, next) {
    /* #swagger.tags = ['Manager']
       #swagger.description = 'This route is used to verify OTP sent for email verification' */
    /* #swagger.parameters['data'] = {
        in: 'body',
        description: 'OTP for verification',
        required: true,
        schema: { $ref: "#/definitions/verifyOtp" }
        }
    } */
    return await ManagerService.verifyOtp(req, res, next);
  }
  async login(req, res, next) {
    /* #swagger.tags = ['Manager']
     #swagger.description = 'This route is used to verify OTP and log in the manager after successful email verification.'
     #swagger.parameters['data'] = {
       in: 'body',
       description: 'Manager login details with email, password, and OTP for verification.',
       required: true,
       schema: { $ref: "#/definitions/loginManager" }
     }
  */
    return await ManagerService.login(req, res, next);
  }
  async getAllCustomers(req, res, next) {
    /* #swagger.tags = ['Manager']
     #swagger.description = 'This route retrieves all customers stored in the system, with optional filters for customerName, accountNumber, and emailId.'
     #swagger.parameters['customerName'] = {
       in: 'query',
       description: 'Filter customers by name.',
       required: false,
       type: 'string',
     }
     #swagger.parameters['accountNumber'] = {
       in: 'query',
       description: 'Filter customers by account number.',
       required: false,
       type: 'string',
     }
     #swagger.parameters['emailId'] = {
       in: 'query',
       description: 'Filter customers by email ID.',
       required: false,
       type: 'string',
     }
  */
    return await ManagerService.getAllCustomers(req, res, next);
  }
  async getAllManagers(req, res, next) {
    /* #swagger.tags = ['Manager']
       #swagger.description = 'This route is used to get all Managers' */
    return await ManagerService.getAllManagers(req, res, next);
  }
  async updateCustomerStatus(req, res, next) {
    /* #swagger.tags = ['Manager'] 
     #swagger.description = 'This route is used to update the status of customer accounts.'
  
     #swagger.parameters['status'] = {
        in: 'body',
        description: 'Customer account status update data.',
        required: true,
        schema: { $ref: "#/definitions/updateCustomerStatus" }
     }
    #swagger.security = [{
       "Bearer": []
     }]
    */
    return await ManagerService.updateCustomerStatus(req, res, next);
  }
  async getAllInactiveCustomers(req, res, next) {
    /* 
    #swagger.tags = ['Manager']
    #swagger.description = 'This route is used to fetch all inactive customer accounts.'
    #swagger.security = [{
       "Bearer": []
     }]
  */
    return await ManagerService.getAllInactiveCustomers(req, res, next);
  }
}
export default new ManagerController();
