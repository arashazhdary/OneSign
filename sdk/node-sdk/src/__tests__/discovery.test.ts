import { clearDiscoveryCache, discoverOpenIdConfig, getJwks } from '../discovery';

describe('discovery helpers', () => {
  beforeEach(() => {
    clearDiscoveryCache();
    global.fetch = jest.fn();
  });

  it('discoverOpenIdConfig fetches and caches', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        issuer: 'https://onesign.test',
        jwks_uri: 'https://onesign.test/.well-known/jwks.json',
      }),
    });

    const first = await discoverOpenIdConfig('https://onesign.test/');
    const second = await discoverOpenIdConfig('https://onesign.test');

    expect(first.issuer).toBe('https://onesign.test');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(second.jwks_uri).toContain('jwks.json');
  });

  it('getJwks uses discovery jwks_uri', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          issuer: 'https://onesign.test',
          jwks_uri: 'https://onesign.test/.well-known/jwks.json',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: [{ kty: 'RSA', kid: '1' }] }),
      });

    const jwks = await getJwks('https://onesign.test');
    expect(jwks.keys).toHaveLength(1);
  });
});
