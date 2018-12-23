const jwt = require("jsonwebtoken");
const {SECRET} = require('../config');

/** Middleware: Requires user is logged in. */

function ensureLoggedIn(req, res, next) {
  try {
    const tokenFromBody = req.body.token;
    jwt.verify(tokenFromBody, SECRET);
    return next();
  }

  catch (err) {
    return next({ status: 401, message: "Unauthorized" });
  }
}

function ensureCorrectUser(req, res, next) {
  try {
    const tokenFromBody = req.body.token;
    const token = jwt.verify(tokenFromBody, SECRET);
    if(token.username === req.body.username){
      return next();
    } else {
      throw new Error();
    }
  }

  catch (err) {
    return next({ status: 401, message: "Unauthorized" });
  }
}

function isAdmin(req, res, next) {
  try {
    const tokenFromBody = req.body.token;
    const token = jwt.verify(tokenFromBody, SECRET);
    if(token.isAdmin === true) {
      return next();
    } else {
      throw new Error();
    }
  } 

  catch (err) {
    return next({ status: 401, message: "Unauthorized" });
  }
}

module.exports = {
  ensureLoggedIn,
  ensureCorrectUser,
  isAdmin
}