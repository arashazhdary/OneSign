export type {
  OnesignAuthConfig,
  OnesignUser,
  OpenIdConfiguration,
  JwksResponse,
} from './types';

export { discoverOpenIdConfig, getJwks, clearDiscoveryCache } from './discovery';
export { normalizeClaims } from './claims';
export { validateOnesignToken } from './validateToken';
export { createOnesignAuthMiddleware } from './middleware';
export type { OnesignAuthenticatedRequest } from './middleware';
