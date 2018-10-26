const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

process.env.NODE_ENV = 'test';

let first_user_username;


beforeEach(async () => {
  const firstUserQuery = await db.query(`
  INSERT INTO users ( username, password, first_name, last_name, email, photo_url, is_admin ) 
  VALUES ('H_Blazer', 'iLuvJ.O.', 'Hasier', 'Pastor', 'pastor@hasier.com', 'http://pix.com/gross.jpeg', true) 
  RETURNING username, first_name, last_name, email, photo_url
  `);
  await db.query(`
  INSERT INTO users ( username, password, first_name, last_name, email, photo_url, is_admin ) 
  VALUES ('Juanjoo', 'Juanjo', 'Diego', 'Diego', 'juan@diego.com', 'http://pix.com/gross.jpeg', false) 
  RETURNING username, first_name, last_name, email, photo_url
  `);

  first_user_username = firstUserQuery.rows[0].username
});


afterEach(async () => {
  await db.query(`DELETE FROM users`);
});

afterAll(async () => {
  await db.end();
});

describe('GET /', () => {
  it('it should return a list of all users with their info', async function () {
    let response = await request(app).get('/users');
    expect(response.status).toEqual(200);
    expect(response.body.users.length).toEqual(2);
    expect(Object.keys(response.body.users[0]).length).toEqual(5);
  });

});

describe('GET /:username', () => {
  it('it should get the data for one user based on the username', async function () {
    let response = await request(app).get(`/users/${first_user_username}`);
    expect(response.status).toEqual(200);
    expect(response.body.user.username).toEqual(`${first_user_username}`);
    expect(response.body.user.email).toEqual('pastor@hasier.com');
    expect(Object.keys(response.body.user).length).toEqual(5);
  });

  it('Ensures that error status is 404 if user not there', async function () {
    let response = await request(app).get(`/users/ditto`);

    expect(response.status).toEqual(404);
    expect(response.error.text).toEqual(
      `{"error":{"status":404},"message":"There exists no user with a username of ditto"}`
    );
  });
});

describe('post /', () => {
  it('Creates new user and receive JSON with user info', async function () {
    let response = await request(app).post('/users').send({

      username: "QWERTY",
      password: "CorgiLover",
      first_name: "QWERTY",
      last_name: "YTREWQ",
      email: "creative@imhungry.com",
      photo_url: "http://pix.com/cute.jpeg",

    });
    expect(response.body.user.username).toEqual('QWERTY');
    expect(response.body.user.email).toEqual('creative@imhungry.com');
    let data = await db.query(`select is_admin from users WHERE username = 'QWERTY'`);
    expect(data.rows.length).toEqual(1);
    expect(data.rows[0].is_admin).toEqual(false);

  });

  it('Ensures that JSON validation is working', async function () {
    let response = await request(app)
      .post('/users')
      .send({
        username: "QWERTY",
        password: "CorgiLover",
        first_name: "QWERTY",
        last_name: "YTREWQ",
        email: "creative@imhungry.com",

      });
    expect(response.status).toEqual(500);
  });
});


describe('patch /', () => {
  it('Ensures that patch updates correctly', async function () {
    let response = await request(app)
      .patch(`/users/${first_user_username}`)
      .send({
        last_name: 'Nuns123'
      });
    expect(response.status).toEqual(200);
    expect(response.body.user.last_name).toEqual('Nuns123');
    expect(response.body.user.email).toEqual('pastor@hasier.com');
    let query = await db.query(
      `SELECT last_name FROM users WHERE username = '${first_user_username}'`
    );
    expect(query.rows[0].last_name).toEqual('Nuns123');
  });
  it('Ensures that error status is 404 if company not there', async function () {
    let response = await request(app).patch(`/users/rebeccablack`).send({
      last_name: 'orange'
    });

    expect(response.status).toEqual(404);
    // Come back to this once route created!
    expect(response.error.text).toEqual("{\"error\":{\"status\":404},\"message\":\"There exists no users with a username of rebeccablack\"}");
  });
  // Can we change username, primary key?!?!?

});



describe('delete /', () => {
  it('Ensures that delete route works correctly', async function () {
    let response = await request(app).delete(`/users/${first_user_username}`);

    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual('User Deleted!!!');
    let query = await db.query(
      `SELECT username FROM users WHERE username = '${first_user_username}'`
    );
    expect(query.rows.length).toEqual(0);
  });

  it('Ensures that error status is 404 if company not there', async function () {
    let response = await request(app).delete(`/users/rebeccablack`);

    expect(response.status).toEqual(404);
    // Come back to this once route created!
    expect(response.error.text).toEqual('{\"error\":{\"status\":404},\"message\":\"Not Found\"}');
  });
});