import Joi from 'joi';
class ManagerValidation {
  createManager(data) {
    const schema = Joi.object({
      fullName: Joi.string().min(3).max(50).required().messages({
        'string.base': 'Full name must be a string.',
        'string.min': 'Full name must be at least 3 characters long.',
        'string.max': 'Full name must be at most 50 characters long.',
        'any.required': 'Full name is required.',
      }),
      emailId: Joi.string().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.email': 'Email format is invalid.',
        'any.required': 'Email is required.',
      }),
      password: Joi.string()
        .min(6)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
        .required()
        .messages({
          'string.base': 'Password must be a string.',
          'string.min': 'Password must be at least 6 characters long.',
          'string.pattern.base':
            'Password must contain letters, numbers, and special characters.',
          'any.required': 'Password is required.',
        }),
    });
    return schema.validate(data);
  }
  verifyOtp(data) {
    const schema = Joi.object({
      emailId: Joi.string().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.email': 'Email format is invalid.',
        'any.required': 'Email is required.',
      }),
      otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
          'string.base': 'OTP must be a string.',
          'string.length': 'OTP must be exactly 6 digits long.',
          'string.pattern.base': 'OTP must contain only digits.',
          'any.required': 'OTP is required.',
        }),
    });
    return schema.validate(data);
  }
  updateStatusValidation(data) {
    const schema = Joi.object({
      accountNumber: Joi.string().optional(),
      customerName: Joi.string().optional(),
      emailId: Joi.string().email().optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      status: Joi.string().valid('Active', 'Inactive').required(),
    });

    return schema.validate(data);
  }
}
export default new ManagerValidation();
