using System.Net.Http.Json;
using System.Text.Json;
using Onesign.Sdk.DotNet.Models;

namespace Onesign.Sdk.DotNet.Services;

public class UsersService
{
    private readonly HttpClient _httpClient;
    private readonly AuthService _authService;

    public UsersService(HttpClient httpClient, AuthService authService)
    {
        _httpClient = httpClient;
        _authService = authService;
    }

    public async Task<User> GetUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"/api/users/{userId}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<User>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize user");
    }

    public async Task<User> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"/api/users/by-email/{Uri.EscapeDataString(email)}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<User>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize user");
    }

    public async Task<User> CreateUserAsync(CreateUserRequest createRequest, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Post, "/api/users", cancellationToken);
        request.Content = JsonContent.Create(createRequest);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<User>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize created user");
    }

    public async Task<User> UpdateUserAsync(string userId, UpdateUserRequest updateRequest, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Put, $"/api/users/{userId}", cancellationToken);
        request.Content = JsonContent.Create(updateRequest);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<User>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize updated user");
    }

    public async Task DeleteUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Delete, $"/api/users/{userId}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
    }

    public async Task<PaginatedResult<User>> ListUsersAsync(PaginationRequest? pagination = null, CancellationToken cancellationToken = default)
    {
        pagination ??= new PaginationRequest();
        var queryParams = pagination.ToQueryParameters();
        var queryString = string.Join("&", queryParams.Select(p => $"{p.Key}={Uri.EscapeDataString(p.Value)}"));

        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"/api/users?{queryString}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<PaginatedResult<User>>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize users list");
    }

    public async Task<List<string>> GetUserRolesAsync(string userId, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, $"/api/users/{userId}/roles", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<List<string>>(cancellationToken)
            ?? throw new OnesignException("Failed to deserialize user roles");
    }

    public async Task AssignRoleAsync(string userId, string role, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Post, $"/api/users/{userId}/roles/{role}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
    }

    public async Task RemoveRoleAsync(string userId, string role, CancellationToken cancellationToken = default)
    {
        var request = await CreateAuthorizedRequestAsync(HttpMethod.Delete, $"/api/users/{userId}/roles/{role}", cancellationToken);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
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
