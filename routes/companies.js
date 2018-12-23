const express = require('express');
const router = new express.Router();
const postCompanySchema = require('../schema/postCompanySchema');
const patchCompanySchema = require('../schema/patchCompanySchema');
const Company = require('../models/company.js');
const validateJsonSchema = require('../helpers/validateJsonSchema');
const ensureLoggedIn = require('../middleware/auth');
const isAdmin = require('../middleware/auth');

// Takes query string and returns filtered result in JSON
// => {companies: [companyData, ...]}
router.get('/', ensureLoggedIn, async function (req, res, next) {
  try {
    const { search, min_employees, max_employees } = req.query;

    const result = await Company.getMatchedCompanies(
      search,
      min_employees,
      max_employees
    );

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

router.get('/:handle', ensureLoggedIn, async function (req, res, next) {
  try {
    const handle = req.params.handle;
    const result = await Company.get(handle);

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

//Add company to database, using validation middleware to check req.body.
// => {company: companyData}
router.post('/', isAdmin, validateJsonSchema(postCompanySchema), async function (req, res, next) {
  try {
    const result = await Company.create(req.body);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

//Update company in database, using validation middleware to check req.body.
// => {company: companyData}
router.patch('/:handle', isAdmin, validateJsonSchema(patchCompanySchema), async function (req, res, next) {
  try {
    const result = await Company.update(req.body, req.params.handle);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// Delete company from database
// => {message: "Company deleted"}
router.delete('/:handle', isAdmin, async function (req, res, next) {
  try {
    const result = await Company.delete(req.params.handle);

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// can potentialy change view/model functions so that only one is responsible for making
// response object format correctly
module.exports = router;
