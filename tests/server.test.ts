import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

describe('Server Basic Health & Root Tests', () => {
  it('GET / should return 200 and online status', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ONLINE');
    expect(res.body.timezone).toBe('Asia/Ho_Chi_Minh');
  });

  it('GET /api/health should return status UP', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('GET /api/non-existent-route should return 404', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
