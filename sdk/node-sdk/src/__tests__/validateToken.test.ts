import jwt from 'jsonwebtoken';
import { validateOnesignToken } from '../validateToken';

const signingKey = 'test-signing-key-at-least-32-characters-long';
const issuer = 'https://onesign.test';

function signToken(payload: Record<string, unknown>, audience = 'my-api'): string {
  return jwt.sign(
    { ...payload, sub: payload.sub ?? 'user-1' },
    signingKey,
    { algorithm: 'HS256', issuer, audience, expiresIn: '1h' }
  );
}

describe('validateOnesignToken', () => {
  it('validates HS256 token with signingKey', async () => {
    const token = signToken({
      sub: 'user-1',
      tenant_id: 'tenant-1',
      email: 'u@test.com',
    });

    const user = await validateOnesignToken(token, {
      authority: issuer,
      audience: 'my-api',
      signingKey,
    });

    expect(user.sub).toBe('user-1');
    expect(user.tenantId).toBe('tenant-1');
    expect(user.email).toBe('u@test.com');
  });

  it('rejects invalid signature', async () => {
    const token = signToken({ sub: 'x' });

    await expect(
      validateOnesignToken(token, {
        authority: issuer,
        audience: 'my-api',
        signingKey: 'wrong-key-that-is-also-32-chars-xx',
      })
    ).rejects.toThrow();
  });
});
