const jwt = require("jsonwebtoken");
const {SECRET} = require('../config');

/** Middleware: Requires user is logged in. */

function ensureLoggedIn(req, res, next) {
  try {
    const token = req.body.token;
    jwt.verify(token, SECRET);
    return next();
  }

  catch (err) {
    return next({ status: 401, message: "Unauthorized" });
  }
}