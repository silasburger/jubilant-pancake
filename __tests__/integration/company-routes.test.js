const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

process.env.NODE_ENV = 'test';

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
});

describe('GET /', () => {
  it('should return filtered result based all query strings', async function () {
    let response = await request(app).get(
      '/companies?search=lulu&min_employees=1&max_employees=13001'
    );
    expect(response.body.companies.length).toEqual(1);
    expect(response.body.companies[0].handle).toEqual('LLL');
    expect(response.status).toEqual(200);
    expect(Object.keys(response.body.companies[0]).length).toEqual(2);
  });

  it('should return filtered result based on min and max query strings', async function () {
    let response2 = await request(app).get(
      '/companies?min_employees=13001&max_employees=1000000000'
    );
    expect(response2.body.companies.length).toEqual(1);
    expect(Object.keys(response2.body.companies[0]).length).toEqual(2);
    expect(response2.body.companies[0].name).toEqual('McDonalds');
  });

  it('should return filtered result based only max query strings', async function () {
    let response3 = await request(app).get(
      '/companies?min_employees=0&max_employees=0'
    );
    console.log(response3.body);
    expect(response3.body.companies[0].handle).toEqual('VOL');
    expect(Object.keys(response3.body.companies[0]).length).toEqual(2);
  });
});

describe('post /', () => {
  it('Sends JSON to create new company and receive JSON with company info', async function () {
    let response = await request(app)
      .post('/companies')
      .send({
        handle: 'BBF',
        name: 'Big Brown Firs',
        num_employees: '1',
        description: 'We are a tree supplier',
        logo_url:
          'https://www.paulickreport.com/wp-content/uploads/2013/02/BigBrown.jpg'
      });
    expect(response.body.company.handle).toEqual('BBF');
    let data = await db.query('select * from companies');
    expect(data.rows.length).toEqual(4);
  });

  it('Ensures that JSON validation is working', async function () {
    let response = await request(app)
      .post('/companies')
      .send({
        handle: 12,
        name: 'Big Brown Firs',
        num_employees: '1',
        description: 'We are a tree supplier',
        logo_url:
          'https://www.paulickreport.com/wp-content/uploads/2013/02/BigBrown.jpg'
      });
    expect(response.status).toEqual(500); // what msg should it have?
  });
});

describe('patch /', () => {
  it('Ensures that patch updates correctly', async function () {
    let response = await request(app)
      .patch('/companies/LLL')
      .send({
        description: 'THE LAMEST YOGA COMPANY EVER!'
      });
    expect(response.status).toEqual(200);
    expect(response.body.company.handle).toEqual('LLL');
    expect(response.body.company.description).toEqual(
      'THE LAMEST YOGA COMPANY EVER!'
    );
    let query = await db.query(
      "SELECT description FROM companies WHERE handle = 'LLL'"
    );
    expect(query.rows[0].description).toEqual('THE LAMEST YOGA COMPANY EVER!');
  });
});

describe('delete /', () => {
  it('Ensures that delete route works correctly', async function () {
    let response = await request(app).delete('/companies/MCD');

    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual('Company Deleted!!!');
  });

  it('Ensures that error status is 404 if company not there', async function () {
    let response = await request(app).delete('/companies/BBF');

    expect(response.status).toEqual(404);
    expect(response.error.text).toEqual(
      '{"error":{"status":404},"message":"There exists no companies with a handle of BBF"}'
    );
  });
});

describe('get /qwe', () => {
  it('Ensures that 404 error catches routes that don\'t exist', async function () {
    let response = await request(app).get('/qwe');

    expect(response.status).toEqual(404);
    expect(response.body.message).toEqual('Not Found');
  });
});

describe('get /:handle', () => {
  it('Ensure that we can get company with handle', async function () {
    let response = await request(app).get('/companies/MCD');

    expect(response.status).toEqual(200);
    expect(response.body.company.handle).toEqual('MCD');
  });
});

afterEach(async () => {
  await db.query(`DELETE FROM jobs`);
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});
