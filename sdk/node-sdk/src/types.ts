export interface OnesignAuthConfig {
  /** OneSign base URL (issuer), e.g. https://login.example.com */
  authority: string;
  /** Expected JWT audience (OAuth client id / API resource) */
  audience?: string;
  /** OAuth client id; used as audience when audience is omitted */
  clientId?: string;
  /** HS256 signing key (must match OneSign Jwt:SigningKey when JWKS is empty) */
  signingKey?: string;
  /** Clock skew in seconds (default 300) */
  clockTolerance?: number;
}

export interface OpenIdConfiguration {
  issuer?: string;
  jwks_uri?: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  userinfo_endpoint?: string;
  [key: string]: unknown;
}

export interface JwksResponse {
  keys: Array<Record<string, unknown>>;
}

export interface OnesignUser {
  sub: string;
  email?: string;
  name?: string;
  tenantId?: string;
  clientId?: string;
  roles: string[];
  permissions: string[];
  orgUnitIds: string[];
  claims: Record<string, unknown>;
}
