const express = require('express');
const router = new express.Router();
const postJobSchema = require('../schema/postJobSchema');
const patchJobSchema = require('../schema/patchJobSchema');
const Job = require('../models/Job.js');
const validateJsonSchema = require('../helpers/validateJsonSchema');
const ensureLoggedIn = require('../middleware/auth');
const isAdmin = require('../middleware/auth');


// Takes query string and returns filtered result in JSON
// => { jobs: jobRes.rows }
router.get('/', ensureLoggedIn, async function (req, res, next) {
  try {
    const result = await Job.getMatchedJobs(req.query);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

//gets job based on id in parameter 
//return { jobs: jobRes.rows[0] }
router.get('/:id', ensureLoggedIn, async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

//Add Job to database, using validation middleware to check req.body.
// => { job: jobRes.rows[0] }
router.post('/', isAdmin, validateJsonSchema(postJobSchema), async function (req, res, next) {
  try {
    const result = await Job.create(req.body);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

//Update Job in database, using validation middleware to check req.body.
// => { job: jobRes.rows[0] }
router.patch('/:id', isAdmin, validateJsonSchema(patchJobSchema), async function (req, res, next) {
  try {
    const result = await Job.update(req.body, req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// Delete Job from database
// => {message: "Job deleted"}
router.delete('/:id', isAdmin, async function (req, res, next) {
  try {
    const result = await Job.delete(req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
