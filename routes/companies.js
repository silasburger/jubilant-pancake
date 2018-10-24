const express = require('express');
const router = new express.Router();
const postCompanySchema = require('../schema/postCompanySchema');
const patchCompanySchema = require('../schema/patchCompanySchema');
const Company = require('../models/company.js');
const validateJsonSchema = require('../helpers/validateJsonSchema');

// Takes query string and returns filtered result in JSON
router.get('/', async function(req, res, next) {
  try {
    const { search, min_employees, max_employees } = req.query;

    const result = await Company.handleSearch(
      search,
      +min_employees || 0,
      +max_employees
    );

    return res.json({ companies: result });
  } catch (err) {
    return next(err);
  }
});

//Add company to database, using validation middleware to check req.body.
router.post('/', validateJsonSchema(postCompanySchema), async function(
  req,
  res,
  next
) {
  try {
    return res.json(await Company.createCompany(req.body));
  } catch (err) {
    return next(err);
  }
});

router.patch('/:handle', async function(req, res, next) {
  try {
    const result = await Company.updateCompany(req.body, req.params.handle);

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

router.delete(
  '/:handle',
  validateJsonSchema(patchCompanySchema),
  async function(req, res, next) {
    try {
      const result = await Company.deleteCompany(req.params.handle);

      return res.json(result);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
