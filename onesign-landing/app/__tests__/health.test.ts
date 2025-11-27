import { GET } from '../api/health/route';

describe('Health API', () => {
  it('should return ok status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.service).toBe('onesign-landing');
    expect(data.version).toBe('1.0.0');
  });

  it('should include timestamp and uptime', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeDefined();
    expect(typeof data.uptime).toBe('number');
  });

  it('should include environment', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.environment).toBeDefined();
    expect(['development', 'production', 'test']).toContain(data.environment);
  });
});
