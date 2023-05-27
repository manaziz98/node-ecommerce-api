const request = require('supertest');
const assert = require('assert');
const app = require('../app'); // Assuming your Express app is exported as 'app'

describe('Authentication API', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should authenticate a user and return a token', (done) => {
      const credentials = {
        username: 'user1',
        password: 'password1',
      };

      request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          assert.ok(res.body.token);
          done();
        });
    });

    it('should return an error for invalid username or password', (done) => {
      const credentials = {
        username: 'invaliduser',
        password: 'invalidpassword',
      };

      request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          assert.strictEqual(res.body.err, 'user not found');
          done();
        });
    });
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user and return the user object', (done) => {
      const newUser = {
        username: 'newuser',
        fullname: 'New User',
        email: 'newuser@example.com',
        password: 'newpassword',
        role: 'Owner',
        isActive: true,
      };

      request(app)
        .post('/api/v1/auth/signup')
        .send(newUser)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          assert.strictEqual(res.body.user.username, newUser.username);
          assert.strictEqual(res.body.user.fullname, newUser.fullname);
          assert.strictEqual(res.body.user.email, newUser.email);
          assert.strictEqual(res.body.user.role, newUser.role);
          assert.strictEqual(res.body.user.isActive, newUser.isActive);
          done();
        });
    });

    it('should return an error for existing username', (done) => {
      const existingUser = {
        username: 'user1',
        fullname: 'Existing User',
        email: 'existinguser@example.com',
        password: 'existingpassword',
        role: 'Owner',
        isActive: true,
      };

      request(app)
        .post('/api/v1/auth/signup')
        .send(existingUser)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          assert.strictEqual(res.body.err, 'User with this username exists!!');
          done();
        });
    });
  });
});
