const db = require('../db');
const bcrypt = require('bcrypt');
const partialUpdate = require('../helpers/partialUpdate');
const {SECRET} = require('../config');
const OPTIONS = { expiresIn: 60 * 60 };
const jwt = require("jsonwebtoken");

class User {

  //takes req.body (user info)
  //inserts user into users table and returns user info when created
  //return userRes.rows[0]
  static async create({ username, password, first_name, last_name, email, photo_url, is_admin }) {

    //checks if is admin is okay
    is_admin = is_admin === undefined ? false : is_admin;

    const hashedPassword = await bcrypt.hash(password, 10)
    const userRes = await db.query(
      `INSERT INTO users ( username, password, first_name, last_name, email, photo_url, is_admin ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING username, first_name, last_name, email, photo_url`,
      [username, hashedPassword, first_name, last_name, email, photo_url, is_admin]
    );
    return userRes.rows[0];
  }

  //take username and password
  //hash password
  //pull hashed password from db where username matches
  //check if hashed password matches 
  static async login({username, password}) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const res = await db.query(
        ` SELECT password FROM users WHERE username = $1`
        , [username]);
      const user = res.rows[0];
      if(user) {
        console.log(await bcrypt.compare(hashedPassword, user.password));
        if(await bcrypt.compare(hashedPassword, user.password)) {
          console.log('here');
          let token = jwt.sign({username}, SECRET, options);
          return { token };
        }
      }
      return { message: 'Invalid credentials'};
  }

  //gets all users from users table
  //return usersRes.rows
  static async getAll() {
    const usersRes = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
      FROM users`
    );
    return usersRes.rows;
  }

  //gets user from users table based on username
  //return userRes.rows[0]
  static async get(username) {
    const userRes = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
      FROM users
      WHERE username=$1`,
      [username]
    );

    if (userRes.rows.length === 0) {
      let notFoundError = new Error(
        `There exists no user with a username of ${username}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return userRes.rows[0];
  }

  //takes req.body (user info)
  //inserts user into users table and returns user info when created
  //return userRes.rows[0]
  static async update(changeObj, username) {
    const query = partialUpdate('users', changeObj, 'username', username);
    const userRes = await db.query(query.query, query.values);

    if (userRes.rows.length === 0) {
      let notFoundError = new Error(
        `There exists no users with a username of ${username}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return userRes.rows[0];
  }

  //takes username as query parameter 
  //gets user that matches username and returns user info
  //return true or throws error
  static async delete(username) {
    const deleteRes = await db.query(
      `DELETE FROM users WHERE username = $1 RETURNING username`,
      [username]
    );

    if (deleteRes.rows.length === 0) {
      let notFoundError = new Error(
        `Not Found`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return true;
  }
}

module.exports = User;