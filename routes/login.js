const express = require('express');
const User = require('../models/User.js')
const router = new express.Router();

router.post('/', async function(req, res, next) {
  try {
    const result = await User.login(req.body)
    return res.json(result);
  } catch (e) {
    return next(e);  }
});

module.exports = router;