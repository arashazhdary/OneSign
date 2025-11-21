'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface EndpointDoc {
  method: string;
  path: string;
  title: string;
  description: string;
  response?: any;
  exampleUrl?: string;
}

export default function DiscoveryDocumentationPage() {
  const t = useTranslations();
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  const endpoints: EndpointDoc[] = [
    {
      method: 'GET',
      path: '/.well-known/openid-configuration',
      title: 'OpenID Connect Discovery',
      description: 'Returns the OpenID Connect discovery document containing metadata about the authorization server.',
      exampleUrl: 'https://your-domain.com/.well-known/openid-configuration',
      response: {
        issuer: 'https://your-domain.com',
        authorization_endpoint: 'https://your-domain.com/connect/authorize',
        token_endpoint: 'https://your-domain.com/connect/token',
        userinfo_endpoint: 'https://your-domain.com/connect/userinfo',
        jwks_uri: 'https://your-domain.com/.well-known/jwks.json',
        response_types_supported: ['code', 'token', 'id_token', 'code id_token', 'code token', 'id_token token', 'code id_token token'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        scopes_supported: ['openid', 'profile', 'email', 'roles', 'offline_access'],
        token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
        claims_supported: ['sub', 'name', 'email', 'email_verified', 'roles', 'tenant_id']
      }
    },
    {
      method: 'GET',
      path: '/.well-known/jwks.json',
      title: 'JSON Web Key Set',
      description: 'Returns the JSON Web Key Set (JWKS) containing the public keys used to verify JWT signatures.',
      exampleUrl: 'https://your-domain.com/.well-known/jwks.json',
      response: {
        keys: [
          {
            kty: 'RSA',
            use: 'sig',
            kid: 'key-id-1',
            alg: 'RS256',
            n: 'modulus-value...',
            e: 'AQAB'
          }
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/discovery/user-info',
      title: 'User Info Endpoint',
      description: 'Returns claims about the authenticated user. This endpoint requires a valid access token.',
      exampleUrl: 'https://your-domain.com/api/discovery/user-info',
      response: {
        sub: 'user-id-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        email_verified: true,
        roles: ['tenant_admin', 'user'],
        tenant_id: 'tenant-123',
        preferred_username: 'johndoe'
      }
    }
  ];

  const toggleEndpoint = (path: string) => {
    setExpandedEndpoint(expandedEndpoint === path ? null : path);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Discovery & OAuth Endpoints
        </h1>
        <p className="text-gray-600 text-lg">
          Standard OAuth 2.0 and OpenID Connect discovery endpoints for authentication and authorization.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">About Discovery Endpoints</h2>
        <p className="text-blue-800">
          These endpoints provide metadata and configuration information about the OneSign identity provider.
          They follow the OpenID Connect Discovery specification and are used by OAuth/OIDC clients to
          automatically configure authentication.
        </p>
      </div>

      <div className="space-y-4">
        {endpoints.map((endpoint) => (
          <div key={endpoint.path} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleEndpoint(endpoint.path)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded font-semibold text-sm ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-lg font-mono text-gray-800">{endpoint.path}</code>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform ${
                    expandedEndpoint === endpoint.path ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mt-3 text-gray-900">{endpoint.title}</h3>
              <p className="text-gray-600 mt-2">{endpoint.description}</p>
            </div>

            {expandedEndpoint === endpoint.path && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                {/* Example URL */}
                {endpoint.exampleUrl && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Example URL</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                      {endpoint.exampleUrl}
                    </div>
                  </div>
                )}

                {/* Request Headers */}
                {endpoint.path === '/api/discovery/user-info' && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Request Headers</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                      <div>Authorization: Bearer YOUR_ACCESS_TOKEN</div>
                      <div>Accept: application/json</div>
                    </div>
                  </div>
                )}

                {/* Response Example */}
                {endpoint.response && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Response Example</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(endpoint.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <h4 className="font-semibold text-yellow-900 mb-2">Notes</h4>
                  <ul className="list-disc list-inside text-yellow-800 space-y-1">
                    {endpoint.path === '/.well-known/openid-configuration' && (
                      <>
                        <li>This endpoint is publicly accessible and does not require authentication</li>
                        <li>Used by OAuth/OIDC clients for automatic configuration</li>
                        <li>Cached for performance - may take up to 1 hour to reflect changes</li>
                      </>
                    )}
                    {endpoint.path === '/.well-known/jwks.json' && (
                      <>
                        <li>This endpoint is publicly accessible</li>
                        <li>Keys are rotated periodically for security</li>
                        <li>Multiple keys may be present during rotation period</li>
                      </>
                    )}
                    {endpoint.path === '/api/discovery/user-info' && (
                      <>
                        <li>Requires valid access token in Authorization header</li>
                        <li>Returns claims about the authenticated user</li>
                        <li>Follows OpenID Connect UserInfo specification</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Integration Guide */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Integration Guide</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">1. Discovery</h3>
            <p className="text-gray-700 mb-2">
              Start by fetching the OpenID Connect discovery document to get all endpoint URLs:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              GET https://your-domain.com/.well-known/openid-configuration
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">2. Token Verification</h3>
            <p className="text-gray-700 mb-2">
              Fetch the JWKS to verify JWT token signatures:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              GET https://your-domain.com/.well-known/jwks.json
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">3. User Information</h3>
            <p className="text-gray-700 mb-2">
              Retrieve user claims using the access token:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              <div>GET https://your-domain.com/api/discovery/user-info</div>
              <div className="mt-2">Authorization: Bearer YOUR_ACCESS_TOKEN</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">4. Common Use Cases</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>OAuth Client Configuration:</strong> Use the discovery document to automatically
                configure OAuth clients
              </li>
              <li>
                <strong>Token Validation:</strong> Use JWKS to validate JWT signatures in API requests
              </li>
              <li>
                <strong>Profile Information:</strong> Use UserInfo endpoint to fetch additional user claims
              </li>
              <li>
                <strong>Multi-tenant Setup:</strong> Each tenant has its own issuer in the claims
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Standards Compliance */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Standards Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-purple-900 mb-2">OAuth 2.0</h3>
            <p className="text-sm text-gray-700">
              RFC 6749 - The OAuth 2.0 Authorization Framework
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-blue-900 mb-2">OpenID Connect</h3>
            <p className="text-sm text-gray-700">
              OpenID Connect Core 1.0 with Discovery support
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-green-900 mb-2">JWT/JWKS</h3>
            <p className="text-sm text-gray-700">
              RFC 7517, 7518, 7519 - JSON Web Token standards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
