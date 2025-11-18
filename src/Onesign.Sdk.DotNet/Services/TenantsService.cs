using System.Net.Http.Json;
using System.Text.Json;
using Onesign.Sdk.DotNet.Models;

namespace Onesign.Sdk.DotNet.Services;

public class TenantsService
{
    private readonly HttpClient _httpClient;
    private readonly AuthService _authService;

    public TenantsService(HttpClient httpClient, AuthService authService)
    {
        _httpClient = httpClient;
        _authService = authService;
    }

    public async Task<Tenant> GetTenantAsync(string tenantId, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"/api/tenants/{tenantId}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<Tenant>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize tenant");
    }

    public async Task<Tenant> GetCurrentTenantAsync(CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, "/api/tenants/current", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<Tenant>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize tenant");
    }

    public async Task<Tenant> UpdateSettingsAsync(string tenantId, UpdateTenantSettingsRequest updateRequest, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Put, $"/api/tenants/{tenantId}/settings", cancellationToken);
        request.Content = JsonContent.Create(updateRequest);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<Tenant>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize updated tenant");
    }

    public async Task<TenantSettings> GetSettingsAsync(string tenantId, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"/api/tenants/{tenantId}/settings", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<TenantSettings>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize tenant settings");
    }

    public async Task<PaginatedResult<Tenant>> ListTenantsAsync(PaginationRequest? pagination = null, CancellationToken cancellationToken = default)
    {
        pagination ??= new PaginationRequest();
        var queryParams = pagination.ToQueryParameters();
        var queryString = string.Join("&", queryParams.Select(p => $"{p.Key}={Uri.EscapeDataString(p.Value)}"));

        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"/api/tenants?{queryString}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<PaginatedResult<Tenant>>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize tenants list");
    }

    private async Task<HttpRequestMessage> CreateAuthorizedRequestAsync(HttpMethod method, string url, CancellationToken cancellationToken)
    {
        var accessToken = await _authService.GetAccessTokenAsync(cancellationToken);
        var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
        return request;
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (!response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            ErrorResponse? error = null;

            try
            {
                error = JsonSerializer.Deserialize<ErrorResponse>(content);
            }
            catch
            {
                // Ignore deserialization errors
            }

            throw new OnesignException(
                error?.ErrorDescription ?? error?.Error ?? $"Request failed with status {response.StatusCode}",
                response.StatusCode,
                error?.Error,
                error?.ValidationErrors,
                error?.TraceId);
        }
    }
}
