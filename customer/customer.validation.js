import Joi from 'joi';

class CustomerValidation {
  createCustomer(data) {
    const schema = Joi.object({
      customerName: Joi.string().min(3).max(50).required().messages({
        'string.base': 'Customer name must be a string.',
        'string.min': 'Customer name must be at least 3 characters long.',
        'string.max': 'Customer name can not be longer than 50 characters.',
        'any.required': 'Customer name is required.',
      }),
      emailId: Joi.string().email().required().messages({
        'string.base': 'Email ID must be a string.',
        'string.email': 'Email ID must be a valid email.',
        'any.required': 'Email ID is required.',
      }),
      phoneNumber: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required(),
      password: Joi.string().min(6).required().messages({
        'string.base': 'Password must be a string.',
        'string.min': 'Password must be at least 6 characters long.',
        'any.required': 'Password is required.',
      }),
      accountType: Joi.string()
        .valid('Savings', 'Current')
        .required()
        .messages({
          'string.base': 'Account type must be a string.',
          'any.required': 'Account type is required.',
          'any.only': 'Account type must be either "Savings" or "Current".',
        }),
      initialDeposit: Joi.number().min(0).optional().messages({
        'number.base': 'Initial deposit must be a number.',
        'number.min': 'Initial deposit cannot be negative.',
      }),
    });
    return schema.validate(data, {abortEarly: false});
  }
  getTransactionHistory(data) {
    const schema = Joi.object({
      accountNumber: Joi.string().required().messages({
        'string.base': 'Account number must be a string.',
        'any.required': 'Account number is required.',
      }),
      startDate: Joi.date().iso().optional().messages({
        'date.base': 'Start date must be a valid ISO date.',
      }),
      endDate: Joi.date().iso().optional().messages({
        'date.base': 'End date must be a valid ISO date.',
      }),
      minAmount: Joi.number().min(0).optional().messages({
        'number.base': 'Min amount must be a valid number.',
        'number.min': 'Min amount cannot be negative.',
      }),
      maxAmount: Joi.number().min(0).optional().messages({
        'number.base': 'Max amount must be a valid number.',
        'number.min': 'Max amount cannot be negative.',
      }),
      amount: Joi.number().optional().messages({
        'number.base': 'Amount must be a valid number.',
      }),
      transactionType: Joi.string()
        .valid('Deposit', 'Withdrawal')
        .optional()
        .messages({
          'string.base': 'Transaction type must be a string.',
          'any.only':
            'Transaction type must be either "Deposit" or "Withdrawal".',
        }),
      status: Joi.string()
        .valid('Pending', 'Success', 'Fail')
        .optional()
        .messages({
          'string.base': 'Status must be a string.',
          'any.only': 'Status must be either "Pending", "Success", or "Fail".',
        }),
      sortBy: Joi.string()
        .valid('date', 'amount')
        .optional()
        .default('date')
        .messages({
          'string.base': 'Sort by must be a string.',
          'any.only': 'Sort by must be either "date" or "amount".',
        }),
      sortOrder: Joi.string()
        .valid('asc', 'desc')
        .optional()
        .default('desc')
        .messages({
          'string.base': 'Sort order must be a string.',
          'any.only': 'Sort order must be either "asc" or "desc".',
        }),
    });
    return schema.validate(data, {abortEarly: false});
  }
}

export default new CustomerValidation();
