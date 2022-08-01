const Joi = require('joi');
const Task = require('../models/task');

const sortSchema = Joi.object({
  sortBy: Joi.any()
    .valid(...Object.keys(Task.schema.tree))
    .required(),
  sortType: Joi.any().valid('asc', 'desc').required(),
});

completedSchema = Joi.object({
  completed: Joi.valid('true', 'false'),
});
limitSchema = Joi.object({
  limit: Joi.number(),
});
skipSchema = Joi.object({
  skip: Joi.number(),
});

module.exports = { sortSchema, completedSchema, limitSchema, skipSchema };
