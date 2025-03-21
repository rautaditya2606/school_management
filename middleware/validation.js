const Joi = require('joi');

const schoolSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

const locationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

module.exports = { schoolSchema, locationSchema };
