import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usersService } from '@/lib/api/services';

export default function DocsUserinfoPage() {
  const { t } = useTranslation();
  const [showTryIt, setShowTryIt] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTryIt = async () => {
    if (!accessToken) {
      setResponse('Please provide an access token');
      return;
    }

    setLoading(true);
    try {
      const data = await usersService.getUserInfo(accessToken);
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          UserInfo Endpoint
        </h1>
        <p className="text-gray-600 text-lg">
          OpenID Connect UserInfo Endpoint for retrieving authenticated user claims
        </p>
      </div>

      {/* Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold text-blue-900 mb-3">Overview</h2>
        <p className="text-blue-800 mb-3">
          The UserInfo endpoint returns claims about the authenticated end-user. This endpoint
          is part of the OpenID Connect standard and requires a valid OAuth 2.0 access token
          in the Authorization header.
        </p>
        <div className="bg-white p-4 rounded border border-blue-200">
          <code className="text-sm text-blue-900">
            GET /api/connect/userinfo
          </code>
        </div>
      </div>

      {/* Endpoint Details */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Endpoint Details</h2>

        <div className="space-y-6">
          {/* Method */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">HTTP Method</h3>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded font-semibold">
              GET
            </span>
          </div>

          {/* URL */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">URL</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              https://your-domain.com/api/connect/userinfo
            </div>
          </div>

          {/* Authentication */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Authentication</h3>
            <p className="text-gray-600 mb-2">
              This endpoint requires a valid OAuth 2.0 access token with the <code className="bg-gray-100 px-2 py-1 rounded">openid</code> scope.
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              Authorization: Bearer YOUR_ACCESS_TOKEN
            </div>
          </div>

          {/* Headers */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Request Headers</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm space-y-1">
              <div>Authorization: Bearer YOUR_ACCESS_TOKEN</div>
              <div>Accept: application/json</div>
            </div>
          </div>
        </div>
      </div>

      {/* Response */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Response</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Success Response (200 OK)</h3>
            <p className="text-gray-600 mb-2">Returns a JSON object containing user claims:</p>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">
{`{
  "sub": "248289761001",
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "email": "john.doe@example.com",
  "email_verified": true,
  "phone_number": "+1-555-123-4567",
  "phone_number_verified": false,
  "preferred_username": "johndoe",
  "locale": "en-US",
  "zoneinfo": "America/Los_Angeles",
  "updated_at": 1311280970,
  "tenant_id": "tenant-123",
  "roles": ["user", "admin"],
  "org_units": ["org-1", "org-2"],
  "custom_claims": {
    "department": "Engineering",
    "employee_id": "EMP001"
  }
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Error Response (401 Unauthorized)</h3>
            <div className="bg-gray-900 text-red-400 p-4 rounded font-mono text-sm">
              <pre className="whitespace-pre-wrap">
{`{
  "error": "invalid_token",
  "error_description": "The access token is invalid or has expired"
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Claims */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Standard Claims</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">sub</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600">Subject identifier - unique user ID</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">name</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600">Full name of the user</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">given_name</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600">First name</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">family_name</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600">Last name</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">email</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600">Email address</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">email_verified</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">boolean</td>
                <td className="px-6 py-4 text-sm text-gray-600">Email verification status</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">phone_number</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600">Phone number in E.164 format</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">preferred_username</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600">Shorthand username</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">locale</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600">Locale (e.g., en-US)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">updated_at</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">number</td>
                <td className="px-6 py-4 text-sm text-gray-600">Last profile update timestamp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Claims */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">OneSign Custom Claims</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">tenant_id</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                <td className="px-6 py-4 text-sm text-gray-600">Tenant identifier</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">roles</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string[]</td>
                <td className="px-6 py-4 text-sm text-gray-600">User roles within the tenant</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">org_units</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string[]</td>
                <td className="px-6 py-4 text-sm text-gray-600">Organizational units the user belongs to</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">permissions</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string[]</td>
                <td className="px-6 py-4 text-sm text-gray-600">Granted permissions</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">custom_claims</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">object</td>
                <td className="px-6 py-4 text-sm text-gray-600">Additional custom attributes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Code Examples</h2>

        <div className="space-y-6">
          {/* JavaScript */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">JavaScript (Fetch API)</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">
{`const accessToken = 'YOUR_ACCESS_TOKEN';

fetch('https://your-domain.com/api/connect/userinfo', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Accept': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('User Info:', data);
  console.log('User Email:', data.email);
  console.log('User Roles:', data.roles);
})
.catch(error => {
  console.error('Error:', error);
});`}
              </pre>
            </div>
          </div>

          {/* cURL */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">cURL</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">
{`curl -X GET https://your-domain.com/api/connect/userinfo \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Accept: application/json"`}
              </pre>
            </div>
          </div>

          {/* Python */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Python (Requests)</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">
{`import requests

access_token = 'YOUR_ACCESS_TOKEN'
url = 'https://your-domain.com/api/connect/userinfo'

headers = {
    'Authorization': f'Bearer {access_token}',
    'Accept': 'application/json'
}

response = requests.get(url, headers=headers)
user_info = response.json()

print('User Info:', user_info)
print('User Email:', user_info.get('email'))
print('User Roles:', user_info.get('roles'))`}
              </pre>
            </div>
          </div>

          {/* C# */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">C# (.NET)</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">
{`using System.Net.Http;
import { Helmet } from 'react-helmet-async';
using System.Net.Http.Headers;
using System.Text.Json;

var accessToken = "YOUR_ACCESS_TOKEN";
var client = new HttpClient();

client.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", accessToken);
client.DefaultRequestHeaders.Accept.Add(
    new MediaTypeWithQualityHeaderValue("application/json"));

var response = await client.GetAsync(
    "https://your-domain.com/api/connect/userinfo");

var content = await response.Content.ReadAsStringAsync();
var userInfo = JsonSerializer.Deserialize<Dictionary<string, object>>(content);

Console.WriteLine($"User Email: {userInfo["email"]}");
Console.WriteLine($"User Roles: {userInfo["roles"]}");`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Try It Out */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Try It Out</h2>
          <button
            onClick={() => setShowTryIt(!showTryIt)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showTryIt ? 'Hide' : 'Show'} Interactive Test
          </button>
        </div>

        {showTryIt && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded font-mono text-sm"
                placeholder="Paste your access token here"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>

            <button
              onClick={handleTryIt}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Send Request'}
            </button>

            {response && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response
                </label>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{response}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <svg className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <strong>Validate Token Expiry:</strong> Always check if the access token is still valid before making requests
            </div>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <strong>Cache User Info:</strong> Cache the response appropriately to reduce unnecessary API calls
            </div>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <strong>Handle Errors Gracefully:</strong> Implement proper error handling for expired or invalid tokens
            </div>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <strong>Use HTTPS Only:</strong> Always use HTTPS in production to protect tokens in transit
            </div>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <strong>Request Minimal Scopes:</strong> Only request the scopes you need to minimize data exposure
            </div>
          </li>
        </ul>
      </div>

      {/* Related Endpoints */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Related Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/docs/discovery"
            className="block p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-semibold text-blue-600 mb-2">Discovery Endpoints</h3>
            <p className="text-sm text-gray-600">
              OpenID Connect Discovery and JWKS endpoints
            </p>
          </a>
          <div className="block p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-2">Token Endpoint</h3>
            <p className="text-sm text-gray-600">
              OAuth 2.0 token endpoint for obtaining access tokens
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
