const { validate } = require('jsonschema');

function validateJsonSchema(jsonSchema) {
  return function(req, res, next) {
    const result = validate(req.body, jsonSchema);

    if (!result.valid) {
      return next(result.errors.map(error => error.stack));
    }

    return next();
  };
}

module.exports = validateJsonSchema;
