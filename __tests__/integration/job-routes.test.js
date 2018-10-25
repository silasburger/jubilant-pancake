const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

process.env.NODE_ENV = 'test';

beforeAll(async () => {
  await db.query(`
    CREATE TABLE companies (
    handle TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    num_employees INTEGER, 
    description TEXT, 
    logo_url TEXT
  ) 
  `);
  await db.query(`
  CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL,
  salary FLOAT NOT NULL, 
  equity FLOAT NOT NULL CHECK (equity<=1), 
  company_handle TEXT FOREIGN KEY REFERENCES companies ON DELETE CASCADE,
  date_posted timestamp without time zone NOT NULL
  )
  `)
});

beforeEach(async () => {
  await db.query(`
  INSERT INTO companies (handle, name, num_employees, description, logo_url) 
  VALUES ('LLL', 'lululemon', 13000, 'the dopest yoga clothes', 'https://hillsdale.com/wp-content/uploads/2018/05/lululemon-logo-for-web.jpg') 
  RETURNING handle, name, num_employees, description, logo_url
  `);
  await db.query(`
  INSERT INTO companies (handle, name, num_employees, description, logo_url) 
  VALUES ('MCD', 'McDonalds', 1000000, 'put a smile on', 'http://webneel.com/daily/sites/default/files/images/daily/06-2013/3-mcdonalds-mcdiabetes-logo-parody.jpg') 
  RETURNING handle, name, num_employees, description, logo_url
  `);
  await db.query(`
  INSERT INTO companies (handle, name, num_employees, description, logo_url) 
  VALUES ('VOL', 'Volunteers', 0, 'put a smile on!', 'http://webneel.com/daily/sites/default/files/images/daily/06-2013/3-mcdonalds-mcdiabetes-logo-parody.jpg') 
  RETURNING handle, name, num_employees, description, logo_url
  `);
  await db.query(`
  INSERT INTO jobs (title, salary, equity, company_handle, date_posted) 
  VALUES ('Janitor', 3000, 0, MCD, LOCALTIMESTAMP) 
  RETURNING handle, name, num_employees, description, logo_url
  `);
  await db.query(`
  INSERT INTO jobs (title, salary, equity, company_handle, date_posted) 
  VALUES ('SWE', 300000, 0.5, LLL, LOCALTIMESTAMP) 
  RETURNING handle, name, num_employees, description, logo_url
  `);
  await db.query(`
  INSERT INTO jobs (title, salary, equity, company_handle, date_posted) 
  VALUES ('bluntroller', 3000000, 1, VOL, LOCALTIMESTAMP) 
  RETURNING handle, name, num_employees, description, logo_url
  `);
});


afterEach(async () => {
  await db.query(`DELETE FROM jobs`);
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.query(`DROP TABLE companies`);
  await db.query(`DROP TABLE jobs`);
  db.end();
});

describe('GET /', () => {
  it('it should filter based on just the search', async function () {
    let response = await request(app).get(
      '/jobs?search=Jan'
    );
    expect(response.body.jobs.length).toEqual(1);
    expect(response.body.jobs[0].handle).toEqual('LLL');
    expect(response.status).toEqual(200);
    expect(Object.keys(response.body.jobs[0]).length).toEqual(2);
  });

  it('should filter based on just min_salary', async function () {
    let response2 = await request(app).get(
      '/jobs?min_salary=10000'
    );
    expect(response2.body.jobs.length).toEqual(2);
    expect(Object.keys(response2.body.jobs[0]).length).toEqual(2);
    expect(response2.body.jobs[0].handle).toEqual('VOL' || 'LLL');
  });

  it('should filter based on just on min_equity', async function () {
    let response3 = await request(app).get(
      '/jobs?min_equity=0.75'
    );
    expect(response3.body.jobs[0].handle).toEqual('VOL');
    expect(response3.body.jobs[0].title).toEqual('bluntroller');
    expect(Object.keys(response3.body.jobs[0]).length).toEqual(2);
  });

  it('should filter based on min_equity and salary', async function () {
    let response3 = await request(app).get(
      '/jobs?min_equity=0.4&min_salary=30000'
    );
    expect(response3.body.jobs[0].handle).toEqual('VOL' || 'LLL');
    expect(Object.keys(response3.body.jobs[0]).length).toEqual(2);
  });

  it('should filter based on search and salary', async function () {
    let response3 = await request(app).get(
      '/jobs?search=o&min_salary=20000'
    );
    expect(response3.body.jobs[0].handle).toEqual('VOL' || 'LLL');
    expect(Object.keys(response3.body.jobs[0]).length).toEqual(2);
  });

  it('should filter based on search and equity', async function () {
    let response3 = await request(app).get(
      '/jobs?min_equity=0&search=o'
    );
    expect(response3.body.jobs[0].handle).toEqual('VOL' || 'LLL' || 'MCD');
    expect(response3.body.jobs.length).toEqual(3);
    expect(Object.keys(response3.body.jobs[0]).length).toEqual(2);
  });

  it('should filter based on search and equity and salary', async function () {
    let response3 = await request(app).get(
      '/jobs?min_salary=3000&min_equity=0.1&search=L'
    );
    expect(response3.body.jobs[0].handle).toEqual('VOL' || 'LLL');
    expect(response3.body.jobs.length).toEqual(2);
    expect(Object.keys(response3.body.jobs[0]).length).toEqual(2);
  });
});

describe('GET /', () => {
  it('it should get the data for one job based on the id', async function () {
    let response = await request(app).get(
      '/jobs/1'
    );
    expect(response.status).toEqual(200);
    expect(response.body.job.title).toEqual('Janitor');
    expect(response.body.job.comapany_handle).toEqual('MCD');
    expect(Object.keys(response.body.jobs[0]).length).toEqual(2);
  });
  it('Ensures that error status is 404 if job not there', async function () {
    let response = await request(app).delete('/jobs/50');

    expect(response.status).toEqual(404);
    expect(response.error.text).toEqual(
      '{"error":{"status":404},"message":"There exists no jobs with an id of 50"}'
    );
  });
});

describe('post /', () => {
  it('Creates new job and receive JSON with job info', async function () {
    let response = await request(app)
      .post('/jobs')
      .send({
        title: 'Tree Trimmer',
        salary: '1',
        equity: 0.5,
        comapany_handle: 'LLL',
      });
    expect(response.body.job.title).toEqual('Tree Trimmer');
    let data = await db.query('select * from jobs');
    expect(data.rows.length).toEqual(4);
  });

  it('Ensures that JSON validation is working', async function () {
    let response = await request(app)
      .post('/companies')
      .send({
        salary: '1',
        equity: 0.5,
        comapany_handle: 'LLL',
      });
    expect(response.status).toEqual(500);
    // what msg should it have?
  });
});


describe('patch /', () => {
  it('Ensures that patch updates correctly', async function () {
    let response = await request(app)
      .patch('/jobs/3')
      .send({
        title: 'Nun'
      });
    expect(response.status).toEqual(200);
    expect(response.body.job.title).toEqual('Nun');
    expect(response.body.job.salary).toEqual(3000000);
    let query = await db.query(
      "SELECT salary FROM jobs WHERE title = 'Nun'"
    );
    expect(query.rows[0].salary).toEqual(3000000);
  });
});



describe('delete /', () => {
  it('Ensures that delete route works correctly', async function () {
    let response = await request(app).delete('/jobs/1');

    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual('Job Deleted!!!');
  });

  it('Ensures that error status is 404 if company not there', async function () {
    let response = await request(app).delete('/companies/50');

    expect(response.status).toEqual(404);
    // Come back to this once route created!
    expect(response.error.text).toEqual('Not Found');
  });
});