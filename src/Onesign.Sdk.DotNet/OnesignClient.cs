using System.Security.Cryptography;
using System.Text;
using Onesign.Sdk.DotNet.Services;

namespace Onesign.Sdk.DotNet;

public class OnesignClient : IDisposable
{
    private readonly OnesignOptions _options;
    private readonly HttpClient _httpClient;
    private readonly bool _disposeHttpClient;

    public AuthService Auth { get; }
    public UsersService Users { get; }
    public ApplicationsService Applications { get; }
    public TenantsService Tenants { get; }

    public OnesignClient(string baseUrl, string clientId, string clientSecret)
        : this(new OnesignOptions
        {
            BaseUrl = baseUrl,
            ClientId = clientId,
            ClientSecret = clientSecret
        })
    {
    }

    public OnesignClient(OnesignOptions options, HttpClient? httpClient = null)
    {
        _options = options ?? throw new ArgumentNullException(nameof(options));
        _disposeHttpClient = httpClient == null;
        _httpClient = httpClient ?? new HttpClient();

        ConfigureHttpClient();

        Auth = new AuthService(_httpClient, _options);
        Users = new UsersService(_httpClient, Auth);
        Applications = new ApplicationsService(_httpClient, Auth);
        Tenants = new TenantsService(_httpClient, Auth);
    }

    private void ConfigureHttpClient()
    {
        _httpClient.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/'));
        _httpClient.Timeout = _options.Timeout;
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    public (string AuthorizeUrl, string CodeVerifier) BuildAuthorizeUrl(string? state = null)
    {
        var codeVerifier = GenerateCodeVerifier();
        var codeChallenge = GenerateCodeChallenge(codeVerifier);

        var baseUrl = _options.BaseUrl.TrimEnd('/');
        var authorizeUrl = new UriBuilder($"{baseUrl}/connect/authorize");
        var query = new List<string>
        {
            $"client_id={Uri.EscapeDataString(_options.ClientId)}",
            $"redirect_uri={Uri.EscapeDataString(_options.RedirectUri ?? "")}",
            "response_type=code",
            "scope=openid profile email",
            $"code_challenge={Uri.EscapeDataString(codeChallenge)}",
            "code_challenge_method=S256"
        };

        if (!string.IsNullOrEmpty(state))
        {
            query.Add($"state={Uri.EscapeDataString(state)}");
        }

        if (!string.IsNullOrEmpty(_options.TenantId))
        {
            query.Add($"tenantId={Uri.EscapeDataString(_options.TenantId)}");
        }

        authorizeUrl.Query = string.Join("&", query);
        return (authorizeUrl.ToString(), codeVerifier);
    }

    public async Task<Models.TokenResponse?> ExchangeCodeForTokenAsync(string code, string codeVerifier, CancellationToken cancellationToken = default)
    {
        var formData = new List<KeyValuePair<string, string>>
        {
            new("grant_type", "authorization_code"),
            new("code", code),
            new("redirect_uri", _options.RedirectUri ?? ""),
            new("client_id", _options.ClientId),
            new("code_verifier", codeVerifier)
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "/connect/token")
        {
            Content = new FormUrlEncodedContent(formData)
        };

        var response = await _httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        return System.Text.Json.JsonSerializer.Deserialize<Models.TokenResponse>(content);
    }

    private static string GenerateCodeVerifier()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Base64UrlEncode(bytes);
    }

    private static string GenerateCodeChallenge(string codeVerifier)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(codeVerifier));
        return Base64UrlEncode(hash);
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    public void Dispose()
    {
        if (_disposeHttpClient)
        {
            _httpClient.Dispose();
        }
    }
}

