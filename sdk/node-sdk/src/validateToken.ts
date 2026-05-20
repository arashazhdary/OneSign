import jwt, { type JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { discoverOpenIdConfig, getJwks } from './discovery';
import { normalizeClaims } from './claims';
import type { OnesignAuthConfig, OnesignUser } from './types';

function resolveAudience(config: OnesignAuthConfig): string | undefined {
  return config.audience ?? config.clientId;
}

function resolveIssuer(config: OnesignAuthConfig): string {
  return config.authority.replace(/\/+$/, '');
}

function verifyOptions(config: OnesignAuthConfig, issuer: string, audience?: string) {
  return {
    issuer,
    audience,
    algorithms: ['HS256', 'RS256'] as jwt.Algorithm[],
    clockTolerance: config.clockTolerance ?? 300,
  };
}

function payloadToRecord(payload: JwtPayload | string): Record<string, unknown> {
  if (typeof payload === 'string') {
    throw new Error('Unexpected JWT payload type');
  }
  return payload as Record<string, unknown>;
}

async function verifyWithJwks(
  token: string,
  config: OnesignAuthConfig,
  issuer: string,
  audience?: string
): Promise<OnesignUser> {
  const discovery = await discoverOpenIdConfig(config.authority);
  const jwksUri = discovery.jwks_uri ?? `${issuer}/.well-known/jwks.json`;
  const jwks = await getJwks(config.authority);

  if (!jwks.keys?.length) {
    throw new Error(
      'JWKS is empty; set signingKey in config (HS256) to match your OneSign Jwt:SigningKey'
    );
  }

  const client = jwksClient({ jwksUri, cache: true, cacheMaxAge: 60 * 60 * 1000 });

  const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
    if (!header.kid) {
      callback(new Error('JWT header missing kid'));
      return;
    }
    client.getSigningKey(header.kid, (err, key) => {
      if (err || !key) {
        callback(err ?? new Error('Signing key not found'));
        return;
      }
      callback(null, key.getPublicKey());
    });
  };

  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, verifyOptions(config, issuer, audience), (err, payload) => {
      if (err || !payload) {
        reject(err ?? new Error('Invalid token'));
        return;
      }
      resolve(normalizeClaims(payloadToRecord(payload)));
    });
  });
}

/**
 * Validates a OneSign access token and returns normalized user claims.
 */
export async function validateOnesignToken(
  token: string,
  config: OnesignAuthConfig
): Promise<OnesignUser> {
  const issuer = resolveIssuer(config);
  const audience = resolveAudience(config);
  const options = verifyOptions(config, issuer, audience);

  if (config.signingKey) {
    const payload = jwt.verify(token, config.signingKey, {
      ...options,
      algorithms: ['HS256'],
    });
    return normalizeClaims(payloadToRecord(payload as JwtPayload));
  }

  return verifyWithJwks(token, config, issuer, audience);
}
