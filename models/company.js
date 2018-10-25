const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');

class Company {
  static async getMatchedCompanies(search, min_employees, max_employees) {
    // Checks the parameters are valid
    if (+min_employees > +max_employees) {
      let err = new Error('Incorrect Parameters');
      err.status = 400;
      throw err;
    }

    min_employees = min_employees === undefined ? 0 : +min_employees;
    max_employees = max_employees === undefined ? 2147483647 : +max_employees;
    search = search === undefined ? '%%' : `%${search}%`;

    const result = await db.query(
      `
    SELECT handle, name FROM companies 
    WHERE num_employees >= $1
    AND num_employees <= $2
    AND (name ILIKE $3 OR handle ILIKE $3)
    `,
      [min_employees, max_employees, search]
    );

    return result.rows;
  }

  // Creates company in the database and returns {company: Companydata}
  static async create(requestBody) {
    const { handle, name, num_employees, description, logo_url } = requestBody;

    const result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url) 
      VALUES ($1, $2, $3, $4, $5) RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );
    return { company: result.rows[0] };
  }

  // Gets company in the database and company data
  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
       FROM companies 
       WHERE handle = $1`,
      [handle]
    );

    const jobRes = await db.query(
      `SELECT title, salary, equity, company_handle, date_posted
       FROM jobs 
       WHERE company_handle = $1`,
      [handle]
    );

    const result = result.rows[0].push({ jobs: jobRes.rows })

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
