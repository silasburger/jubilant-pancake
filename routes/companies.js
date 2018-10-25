const express = require('express');
const router = new express.Router();
const postCompanySchema = require('../schema/postCompanySchema');
const patchCompanySchema = require('../schema/patchCompanySchema');
const Company = require('../models/company.js');
const validateJsonSchema = require('../helpers/validateJsonSchema');

// Takes query string and returns filtered result in JSON
// => {companies: [companyData, ...]}
router.get('/', async function (req, res, next) {
  try {
    const { search, min_employees, max_employees } = req.query;

    const result = await Company.getMatchedCompanies(
      search,
      min_employees,
      max_employees
    );

    return res.json({ companies: result });
  } catch (err) {
    return next(err);
  }
});

router.get('/:handle', async function (req, res, next) {
  try {
    const handle = req.params.handle;

    const result = await Company.get(handle);

    return res.json({ company: result });
  } catch (err) {
    return next(err);
  }
});

//Add company to database, using validation middleware to check req.body.
// => {company: companyData}
router.post('/', validateJsonSchema(postCompanySchema), async function (
  req,
  res,
  next
) {
  try {
    const result = await Company.create(req.body);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

//Update company in database, using validation middleware to check req.body.
// => {company: companyData}
router.patch('/:handle', validateJsonSchema(patchCompanySchema), async function (
  req,
  res,
  next
) {
  try {
    const result = await Company.update(req.body, req.params.handle);

    return res.json({ company: result });
  } catch (err) {
    return next(err);
  }
});

// Delete company from database
// => {message: "Company deleted"}
router.delete('/:handle', async function (req, res, next) {
  try {
    const result = await Company.delete(req.params.handle);

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
