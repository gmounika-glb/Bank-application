import CustomerService from './customer.service.js';

class CustomerController {
  async createAccount(req, res, next) {
    /* #swagger.tags = ['Customer']
       #swagger.description = 'This route is used to create a new Customer account.'
       #swagger.parameters['data'] = {
         in: 'body',
         description: 'Customer details including fullName, email, phone, and initial deposit.',
         required: true,
         schema: { 
           $ref: "#/definitions/CreateCustomer" 
         }
       } */
    return await CustomerService.createAccount(req, res, next);
  }
  async verifyOtp(req, res, next) {
    /* #swagger.tags = ['Customer']
       #swagger.description = 'This route is used to create a new Customer account.'
       #swagger.parameters['data'] = {
         in: 'body',
         description: 'Customer details including fullName, email, phone, and initial deposit.',
         required: true,
         schema: { 
           $ref: "#/definitions/verifyOtp" 
         }
       } */
    return await CustomerService.verifyOtp(req, res, next);
  }
  async login(req, res, next) {
    /* #swagger.tags = ['Customer']
         #swagger.description = 'This route is used for logging in a customer using their identifier (email, account number, customer name, or customer id).'
         #swagger.parameters['data'] = {
           in: 'body',
           description: 'Customer login details with identifier (email, account number, customer name, or customer id) and password.',
           required: true,
           schema: { $ref: "#/definitions/loginCustomerDetails" }
         } */
    return await CustomerService.login(req, res, next);
  }
  async getAccountBalance(req, res, next) {
    /* #swagger.tags = ['Customer']
     #swagger.description = 'This route is used to get account balance of a customer.'
     #swagger.parameters['accountNumber'] = {
       in: 'query',
       description: 'Account number of the customer whose balance is being fetched.',
       required: true,
       type: 'string'
     } */
    return await CustomerService.getAccountBalance(req, res, next);
  }
  async makeTransaction(req, res, next) {
    /* #swagger.tags = ['Customer']
     #swagger.description = 'This route is used to make a transaction from the customer account.'
     #swagger.parameters['data'] = {
       in: 'body',
       description: 'Make Transaction.',
       required: true,
       schema: { $ref: "#/definitions/makeTransaction" }
     } */
    return await CustomerService.makeTransaction(req, res, next);
  }
  async withdrawFunds(req, res, next) {
    /* #swagger.tags = ['Customer']
     #swagger.description = 'This route is used to withdraw funds from the customer account.'
     #swagger.parameters['data'] = {
       in: 'body',
       description: 'Customer account number.',
       required: true,
       schema: { $ref: "#/definitions/withdrawFunds" }
     } */
    return await CustomerService.withdrawFunds(req, res, next);
  }
  async getAccountDetails(req, res, next) {
    /* #swagger.tags = ['Customer']
     #swagger.description = 'This route is used to retrieve the account details of a customer.'
     #swagger.parameters['accountNumber'] = {
       in: 'query',
       description: 'Account number of the customer whose details are being fetched.',
       required: true,
       type: 'string'
     } */
    return await CustomerService.getAccountDetails(req, res, next);
  }
  async getTransactionHistory(req, res, next) {
    /* #swagger.tags = ['Customer']
       #swagger.description = 'This route is used to fetch the transaction history of a customer with various filters.'
       #swagger.parameters['accountNumber'] = {
         in: 'query',
         description: 'Account number of the customer whose transaction history is being fetched.',
         required: true,
         type: 'string'
       }
       #swagger.parameters['startDate'] = {
         in: 'query',
         description: 'Start date for the date range filter. If not provided, all transactions before the endDate will be returned.',
         required: false,
         type: 'string',
         format: 'date'
       }
       #swagger.parameters['endDate'] = {
         in: 'query',
         description: 'End date for the date range filter. If not provided, all transactions after the startDate will be returned.',
         required: false,
         type: 'string',
         format: 'date'
       }
       #swagger.parameters['minAmount'] = {
         in: 'query',
         description: 'Minimum transaction amount for filtering. If not provided, no minimum amount filter will be applied.',
         required: false,
         type: 'number'
       }
       #swagger.parameters['maxAmount'] = {
         in: 'query',
         description: 'Maximum transaction amount for filtering. If not provided, no maximum amount filter will be applied.',
         required: false,
         type: 'number'
       }
       #swagger.parameters['transactionType'] = {
         in: 'query',
         description: 'Filter by transaction type (Deposit or Withdrawal). If not provided, all types will be considered.',
         required: false,
         type: 'string',
         enum: ['Deposit', 'Withdrawal']
       }
       #swagger.parameters['status'] = {
         in: 'query',
         description: 'Filter by transaction status (Pending, Success, or Fail). If not provided, all statuses will be considered.',
         required: false,
         type: 'string',
         enum: ['Pending', 'Success', 'Fail']
       }
      #swagger.parameters['sortBy'] = {
        in: 'query',
        description: 'Field by which the transactions should be sorted. Default is by date.',
        required: false,
        type: 'string',
        enum: ['date', 'amount']
      }
      #swagger.parameters['sortOrder'] = {
        in: 'query',
        description: 'Order in which the transactions should be sorted. Default is descending.',
        required: false,
        type: 'string',
        enum: ['asc', 'desc']
      } 
    */
    return await CustomerService.getTransactionHistory(req, res, next);
  }
}

export default new CustomerController();
