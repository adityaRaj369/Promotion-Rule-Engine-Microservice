const request = require('supertest');
const app = require('../src/app');
const { resetMetrics } = require('../src/utils/metrics');


// Reset metrics before each test to ensure clean state.
// This is important to avoid interference between tests and to get accurate metrics.
// Each test will start with a fresh metrics state.
describe('Promotion API', () => {
  beforeEach(() => {
    resetMetrics();
  });

  test('POST /promotion should return promotion for valid player in bucket A', async () => {
    const player = {
      userId: '123',
      level: 15,
      spendTier: 'GOLD',
      country: 'US',
      daysSinceLastPurchase: 10
    };
    const response = await request(app)
      .post('/promotion')
      .send(player)
      .expect(200);
    expect(response.body.id).toBe('BONUS_10');
  });

  test('POST /promotion should return 400 for unsupported country', async () => {
    const player = { userId: '123', level: 15, country: 'FR' };
    const response = await request(app)
      .post('/promotion')
      .send(player)
      .expect(400);
    expect(response.body.error).toBe('Invalid or unsupported country code');
  });

  test('POST /promotion should return 400 for missing userId', async () => {
    const player = { level: 15, country: 'US' };
    const response = await request(app)
      .post('/promotion')
      .send(player)
      .expect(400);
    expect(response.body.error).toBe('userId is required for A/B testing');
  });

  test('GET /metrics should return evaluation stats', async () => {
    await request(app)
      .post('/promotion')
      .send({ userId: '123', level: 15, spendTier: 'GOLD', country: 'US', daysSinceLastPurchase: 10 });
    const response = await request(app)
      .get('/metrics')
      .expect(200);
    expect(response.body).toHaveProperty('totalEvaluations', 1);
    expect(response.body.hits.A).toBe(1);
    expect(response.body.misses.A).toBe(0);
  });

  test('POST /reload-rules should reload rules', async () => {
    const response = await request(app)
      .post('/reload-rules')
      .expect(200);
    expect(response.body.message).toBe('Rules reloaded successfully');
  });
});