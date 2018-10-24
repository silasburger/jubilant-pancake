const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');

class Company {
  static async handleSearch(search, min_employees, max_employees) {
    let joinArr = [`num_employees > $1`];
    let values = [min_employees];
    // Checks the parameters are correct
    if (min_employees > max_employees && !max_employees) {
      let err = new Error('Incorrect Parameters');
      err.status = 400;
      throw err;
    }

    if (max_employees) {
      joinArr.push(`num_employees < $2`);
      values.push(max_employees);
    }

    if (search) {
      search = `%${search}%`;
      joinArr.push(`name ILIKE $3 OR handle ILIKE $3`);
      values.push(search);
    }

    let cols = joinArr.join(' AND ');

    const base_query = `SELECT handle, name FROM companies WHERE ${cols}`;

    const result = await db.query(base_query, values);

    return result.rows;
  }

  static async createCompany(requestBody) {
    const { handle, name, num_employees, description, logo_url } = requestBody;

    const result = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url) VALUES ($1, $2, $3, $4, $5) RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );
    return { company: result.rows[0] };
  }

  static async getCompany(handle) {
    const result = await db.query(
      `SELECT handle, name, num_employees, description, logo_url FROM companies WHERE handle = $1`,
      [handle]
    );

    return result.rows[0];
  }

  // WE'LL SEE IF IT WORKS?!?
  static async updateCompany(changeObj, handle) {
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

  static async deleteCompany(handle) {
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
