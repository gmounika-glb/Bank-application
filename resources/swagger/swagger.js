import swaggerAutogen from 'swagger-autogen';
const swagger = swaggerAutogen();
import config from 'config';
const doc = {
  info: {
    version: '1.0',
    title: 'Bank Account App',
    description: 'Bank App Apis documentaion',
  },
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Please provide the admin password',
    },
  },
  host: 'localhost:2025',
  basePath: '/',
  schemes: ['http', 'https'],
  consumes: ['application/json', 'application/x-www-form-urlencoded'],
  produces: ['application/json'],
  definitions: {
    CreateManager: {
      fullName: 'Manager',
      emailId: 'mounig0610@gmail.com',
      password: 'Manager@2025!',
    },
    verifyOtp: {
      emailId: 'mounig0610@gmail.com',
      otp: '24234',
    },
    loginManager: {
      fullName: 'Manager',
      emailId: 'mounig0610@gmail.com',
      password: 'Manager@2025!',
    },
    CreateCustomer: {
      accountType: 'Savings',
      customerName: 'Customer',
      emailId: 'mounig0610@gmail.com',
      password: 'Customer@2025!',
      phoneNumber: '9876543210',
      initialDeposit: 10000,
    },
    loginCustomerDetails: {
      identifier: 'mounig0610@gmail.com (or) Customer (or) 788320104709',
      password: 'Customer@2025!',
    },
    updateCustomerStatus: {
      accountNumber: '1234567890',
      customerName: 'Customer',
      emailId: 'mounig0610@gmail.com',
      startDate: '2025-02-18',
      endDate: '2025-02-20',
      status: 'Active',
    },
    makeTransaction: {
      senderAccountNumber: '1234567890',
      receiverAccountNumber: '0987654321',
      amount: 1000,
    },
    withdrawFunds: {
      accountNumber: '1234567890',
      amount: 1200,
    },
  },
};

const outputFile = './resources/swagger/swagger-api-view.json';
const endpointsFiles = ['./resources/mainRoutes/main.route.js'];

/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */

await swagger(outputFile, endpointsFiles, doc);
