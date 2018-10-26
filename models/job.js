const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');

class Job {

  static async getMatchedJobs({ search, min_salary, min_equity }) {
    // Checks the parameters are valid


    // if (+min_employees > +max_employees) {
    //   let err = new Error('Incorrect Parameters');
    //   err.status = 400;
    //   throw err;
    // }

    min_salary = min_salary === undefined ? 0 : +min_salary;
    min_equity = min_equity === undefined ? 0 : +min_equity;
    search = search === undefined ? '%%' : `%${search}%`;

    const jobRes = await db.query(
      `
    SELECT title, company_handle 
    FROM jobs 
    WHERE salary >= $1
    AND equity >= $2
    AND (title ILIKE $3 OR company_handle ILIKE $3)
    ORDER BY date_posted desc
    `,
      [min_salary, min_equity, search]
    );

    return { jobs: jobRes.rows };
  }


  static async create({ title, salary, equity, company_handle }) {
    const jobRes = await db.query(
      `INSERT INTO jobs ( title, salary, equity, company_handle, date_posted) 
      VALUES ($1, $2, $3, $4, LOCALTIMESTAMP) 
      RETURNING title, salary, equity, company_handle, date_posted`,
      [title, salary, equity, company_handle]
    );

    return { job: jobRes.rows[0] };
  }

  static async get(id) {
    const jobRes = await db.query(
      `SELECT title, salary, equity, company_handle, date_posted
       FROM jobs 
       WHERE id=$1`,
      [+id]
    );

    if (jobRes.rows.length === 0) {
      let notFoundError = new Error(
        `There exists no job with an id of ${id}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return { job: jobRes.rows[0] }
  }

  static async update(changeObj, id) {
    const query = partialUpdate('jobs', changeObj, 'id', id);

    const jobRes = await db.query(query.query, query.values);

    if (jobRes.rows.length === 0) {
      let notFoundError = new Error(
        `There exists no jobs with an id of ${id}`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return { job: jobRes.rows[0] };
  }

  static async delete(id) {
    const jobRes = await db.query(
      `DELETE FROM jobs WHERE id = $1 RETURNING id`,
      [id]
    );

    if (jobRes.rows.length === 0) {
      let notFoundError = new Error(
        `Not Found`
      );
      notFoundError.status = 404;
      throw notFoundError;
    }

    return { message: 'Job Deleted!!!' };
  }

}


module.exports = Job;
