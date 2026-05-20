import type { JwksResponse, OpenIdConfiguration } from './types';
import { TtlCache } from './cache';

const discoveryCache = new TtlCache<OpenIdConfiguration>(60 * 60 * 1000);
const jwksCache = new TtlCache<JwksResponse>(60 * 60 * 1000);

function normalizeAuthority(authority: string): string {
  return authority.replace(/\/+$/, '');
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return (await response.json()) as T;
}

/**
 * Fetches OpenID Connect discovery document (cached).
 */
export async function discoverOpenIdConfig(authority: string): Promise<OpenIdConfiguration> {
  const base = normalizeAuthority(authority);
  const cached = discoveryCache.get(base);
  if (cached) return cached;

  const config = await fetchJson<OpenIdConfiguration>(`${base}/.well-known/openid-configuration`);
  discoveryCache.set(base, config);
  return config;
}

/**
 * Fetches JWKS from discovery jwks_uri or `/.well-known/jwks.json` (cached).
 */
export async function getJwks(authority: string): Promise<JwksResponse> {
  const base = normalizeAuthority(authority);
  const cached = jwksCache.get(base);
  if (cached) return cached;

  const discovery = await discoverOpenIdConfig(base);
  const jwksUrl = discovery.jwks_uri ?? `${base}/.well-known/jwks.json`;
  const jwks = await fetchJson<JwksResponse>(jwksUrl);
  jwksCache.set(base, jwks);
  return jwks;
}

/** Clears discovery/JWKS caches (for tests). */
export function clearDiscoveryCache(): void {
  discoveryCache.clear();
  jwksCache.clear();
}
