import request from 'supertest';
import app from '../src/index.js';
import { UserService } from '../src/services/user.service.js';

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
};

// Setup before tests
beforeAll(async () => {
  // Firebase is already initialized in the app
  // No additional setup needed for Firebase
});

// Clean up database after tests
afterAll(async () => {
  // Find and delete test user
  const testUserData = await UserService.findUserByEmail(testUser.email);
  if (testUserData) {
    await UserService.deleteUser(testUserData.id);
  }
});

describe('Auth API', () => {
  let token;

  // Test user registration
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', testUser.email);
    });

    it('should not register a user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('status', 'error');
    });
  });

  // Test user login
  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('token');

      // Save token for protected route tests
      token = res.body.data.token;
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('status', 'error');
    });
  });

  // Test protected route
  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('email', testUser.email);
    });

    it('should not access protected route without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('status', 'error');
    });
  });
});