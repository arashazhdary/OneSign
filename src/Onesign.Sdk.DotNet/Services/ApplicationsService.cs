using System.Net.Http.Json;
using System.Text.Json;
using Onesign.Sdk.DotNet.Models;

namespace Onesign.Sdk.DotNet.Services;

public class ApplicationsService
{
    private readonly HttpClient _httpClient;
    private readonly AuthService _authService;

    public ApplicationsService(HttpClient httpClient, AuthService authService)
    {
        _httpClient = httpClient;
        _authService = authService;
    }

    public async Task<Application> GetApplicationAsync(string applicationId, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"/api/applications/{applicationId}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<Application>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize application");
    }

    public async Task<Application> GetApplicationByClientIdAsync(string clientId, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"/api/applications/by-client-id/{Uri.EscapeDataString(clientId)}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<Application>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize application");
    }

    public async Task<Application> CreateApplicationAsync(CreateApplicationRequest createRequest, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Post, "/api/applications", cancellationToken);
        request.Content = JsonContent.Create(createRequest);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<Application>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize created application");
    }

    public async Task<Application> UpdateApplicationAsync(string applicationId, UpdateApplicationRequest updateRequest, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Put, $"/api/applications/{applicationId}", cancellationToken);
        request.Content = JsonContent.Create(updateRequest);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<Application>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize updated application");
    }

    public async Task DeleteApplicationAsync(string applicationId, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Delete, $"/api/applications/{applicationId}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
    }

    public async Task<PaginatedResult<Application>> ListApplicationsAsync(PaginationRequest? pagination = null, CancellationToken cancellationToken = default)
    {
        pagination ??= new PaginationRequest();
        var queryParams = pagination.ToQueryParameters();
        var queryString = string.Join("&", queryParams.Select(p => $"{p.Key}={Uri.EscapeDataString(p.Value)}"));

        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"/api/applications?{queryString}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<PaginatedResult<Application>>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize applications list");
    }

    public async Task<string> RegenerateClientSecretAsync(string applicationId, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Post, $"/api/applications/{applicationId}/regenerate-secret", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        var result = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize client secret");

        return result["clientSecret"];
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
