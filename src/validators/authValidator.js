const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().max(64).required(),
    email: Joi.string().email().max(128).required(),
    password: Joi.string().min(6).max(64).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().max(128).required(),
    password: Joi.string().min(6).max(64).required()
});

module.exports = { registerSchema, loginSchema };
