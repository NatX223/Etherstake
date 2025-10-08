import Joi from 'joi';
import { ApiError } from './error.middleware.js';

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 */
export const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);
    
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    return next(new ApiError(400, errorMessage));
  }
  
  // Replace request properties with validated values
  Object.assign(req, value);
  return next();
};

/**
 * Helper function to pick only specified properties from an object
 * @param {Object} object - Source object
 * @param {Array} keys - Keys to pick
 * @returns {Object} - New object with only the keys specified
 */
const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

/**
 * Common validation schemas
 */
export const validationSchemas = {
  // User validation schemas
  register: {
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/)
    }),
  },
  login: {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },
  
  // Staking validation schemas
  createStake: {
    body: Joi.object().keys({
      amount: Joi.number().positive().required(),
      duration: Joi.number().integer().min(1).required(),
      walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
    }),
  },
  
  // ID parameter validation
  idParam: {
    params: Joi.object().keys({
      id: Joi.string().required(),
    }),
  },
};