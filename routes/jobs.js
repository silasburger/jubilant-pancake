const express = require('express');
const router = new express.Router();
const postJobSchema = require('../schema/postJobSchema');
const patchJobSchema = require('../schema/patchJobSchema');
const Job = require('../models/Job.js');
const validateJsonSchema = require('../helpers/validateJsonSchema');


// Takes query string and returns filtered result in JSON
// => {jobs: [JobData, ...]}
router.get('/', async function (req, res, next) {
  try {
    const result = await Job.getMatchedJobs(req.query);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const result = await Job.get(req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

//Add Job to database, using validation middleware to check req.body.
// => {Job: JobData}
router.post('/', validateJsonSchema(postJobSchema), async function (req, res, next) {
  try {
    const result = await Job.create(req.body);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

//Update Job in database, using validation middleware to check req.body.
// => {Job: JobData}
router.patch('/:id', validateJsonSchema(patchJobSchema), async function (req, res, next) {
  try {
    const result = await Job.update(req.body, req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// Delete Job from database
// => {message: "Job deleted"}
router.delete('/:id', async function (req, res, next) {
  try {
    const result = await Job.delete(req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
