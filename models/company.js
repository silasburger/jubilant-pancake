const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');

class Company {
  static async getMatchedCompanies(search, min_employees = 0, max_employees) {
    let joinArr = [`num_employees >= $1`];

    // Values contains arguments to pass into query
    let values = [+min_employees];

    // Checks the parameters are valid
    if (+min_employees > +max_employees && max_employees !== undefined) {
      let err = new Error('Incorrect Parameters');
      err.status = 400;
      throw err;
    }

    if (max_employees !== undefined) {
      joinArr.push(`num_employees <= $2`);
      values.push(+max_employees);
    }

    if (search !== undefined) {
      search = `%${search}%`;
      joinArr.push(`name ILIKE $3 OR handle ILIKE $3`);
      values.push(search);
    }

    let cols = joinArr.join(' AND ');

    const base_query = `SELECT handle, name FROM companies WHERE ${cols}`;

    const result = await db.query(base_query, values);

    return result.rows;
  }

  // Creates company in the database and returns {company: Companydata}
  static async create(requestBody) {
    const { handle, name, num_employees, description, logo_url } = requestBody;

    const result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ($1, $2, $3, $4, $5) RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );
    return { company: result.rows[0] };
  }
  // Gets company in the database and company data
  static async get(handle) {
    const result = await db.query(
      `SELECT handle, name, num_employees, description, logo_url 
       FROM companies 
       WHERE handle = $1`,
      [handle]
    );

    return result.rows[0];
  }
  // Takes object with values to change and the handle of company
  // Returns company data of updated company
  // updateCompany({description: 'THE LAMEST YOGA COMPANY EVER!'}, LLL)

  static async update(changeObj, handle) {
    const query = partialUpdate('companies', changeObj, 'handle', handle);

    const result = await db.query(query.query, query.values);

    if (result.rows.length === 0) {
      let notFoundError = new Error(
        `There exists no companies with a handle of ${handle}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return result.rows[0];
  }

  // Deletes company from databse and returns confirmation message
  static async delete(handle) {
    const result = await db.query(
      `DELETE FROM companies WHERE handle = $1 RETURNING handle`,
      [handle]
    );

    if (result.rows.length === 0) {
      let notFoundError = new Error(
        `There exists no companies with a handle of ${handle}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return { message: 'Company Deleted!!!' };
  }
}

module.exports = Company;
