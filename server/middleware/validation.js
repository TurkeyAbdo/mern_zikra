import Joi from 'joi';
import mongoose from 'mongoose';
import { httpError } from './errorHandler.js';

const name = Joi.string().trim().min(1).max(60).required();
const email = Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254).required();
const password = Joi.string().min(8).custom((value, helpers) =>
  Buffer.byteLength(value) <= 72 ? value : helpers.message({ custom: 'Password must be at most 72 bytes.' })
).required();
const optionalText = max => Joi.string().trim().max(max).allow('');
export const registration = Joi.object({
  firstName: name, lastName: name, email, password,
  location: optionalText(100), description: optionalText(500), occupation: optionalText(100)
});
export const login = Joi.object({ email, password: Joi.string().max(1000).required() });
export const photoFields = Joi.object({ title: Joi.string().trim().max(100).required(), description: optionalText(2000) });
export const commentFields = Joi.object({ comment: Joi.string().trim().max(1000).required() });

export function validate(schema) {
  return (req, res, next) => {
    const { value, error } = schema.required().validate(req.body, { abortEarly: true });
    if (error) return next(httpError(400, error.details[0].message));
    req.body = value;
    next();
  };
}
export function validId(req, res, next, id) {
  next(mongoose.isObjectIdOrHexString(id) ? undefined : httpError(400, 'Invalid photo ID.'));
}
