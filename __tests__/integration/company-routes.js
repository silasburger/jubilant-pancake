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
});

describe('GET /', () => {
  it('should generate a proper partial update query with just 1 field', async function() {
    let response = await request(app).get(
      '/companies?search=lulu&min_employees=1&max_employees=13001'
    );
    expect(response.body.companies.length).toEqual(1);
    expect(response.body.companies[0].handle).toEqual('LLL');
    expect(response.status).toEqual(200);
    expect(Object.keys(response.body.companies[0]).length).toEqual(2);

    let response2 = await request(app).get(
      '/companies?min_employees=13&max_employees=1000000000'
    );
    expect(response2.body.companies.length).toEqual(2);
    expect(Object.keys(response2.body.companies[0]).length).toEqual(2);

    let response3 = await request(app).get(
      '/companies?max_employees=1000000000'
    );
    expect(response3.body.companies.length).toEqual(2);
    expect(Object.keys(response3.body.companies[0]).length).toEqual(2);
  });
});

describe('post /', () => {
  it('Send JSON to create new company and receive JSON with company info', async function() {
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
    expect(data.rows.length).toEqual(3);
  });
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.query(`DROP TABLE companies`);
  db.end();
});
