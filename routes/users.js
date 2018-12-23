const express = require('express');
const router = new express.Router();
const postUserSchema = require('../schema/postUserSchema');
const patchUserSchema = require('../schema/patchUserSchema');
const User = require('../models/User.js');
const validateJsonSchema = require('../helpers/validateJsonSchema');
const ensureCorrectUser = require('../middleware/auth');

// Gets all users
// => { users: userInfos }
router.get('/', async function (req, res, next) {
  try {
    const users = await User.getAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

// Gets one user based on username
// => { user: userInfo }
router.get('/:username', async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

//Add User to database, using validation middleware to check req.body.
// => { user: addedUserInfo }
router.post('/', validateJsonSchema(postUserSchema), async function (req, res, next) {
  try {
    const user = await User.create(req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

//Update User in database, using validation middleware to check req.body.
// => { user: updatedUser }
router.patch('/:username', ensureCorrectUser, validateJsonSchema(patchUserSchema), async function (req, res, next) {
  try {
    const user = await User.update(req.body, req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

//Update User in database, using validation middleware to check req.body.
// => { user: updatedUser }
router.delete('/:username', ensureCorrectUser, async function (req, res, next) {
  try {
    //We are just checking to see if this query raises an error, if it doesn't the res
    //will always be true
    await User.delete(req.params.username);
    return res.json({ message: 'User Deleted!!!' });
  } catch (err) {
    return next(err);
  }
});





module.exports = router;