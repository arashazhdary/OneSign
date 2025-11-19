using Microsoft.Extensions.Logging;

namespace Onesign.Shared.Platform.Services.Implementations;

public class ApiDocumentationService : IApiDocumentationService
{
    private readonly ILogger<ApiDocumentationService> _logger;

    public ApiDocumentationService(ILogger<ApiDocumentationService> logger)
    {
        _logger = logger;
    }

    public async Task<OpenApiSpecification> GetOpenApiSpecificationAsync(CancellationToken cancellationToken = default)
    {
        var endpoints = await GetEndpointsAsync(cancellationToken: cancellationToken);

        var specification = new OpenApiSpecification
        {
            Version = "3.0.3",
            Title = "OneSign Identity Platform API",
            Description = "Comprehensive API documentation for the OneSign Identity Platform",
            GeneratedAt = DateTime.UtcNow,
            EndpointCount = endpoints.Count,
            SchemaCount = 150,
            SpecificationJson = GenerateOpenApiJson()
        };

        return specification;
    }

    public async Task<OpenApiSpecification> GenerateDocumentationAsync(GenerateDocumentationRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating API documentation, IncludeExamples: {IncludeExamples}", request.IncludeExamples);

        var specification = await GetOpenApiSpecificationAsync(cancellationToken);

        return specification;
    }

    public async Task<IReadOnlyList<ApiEndpoint>> GetEndpointsAsync(string? module = null, CancellationToken cancellationToken = default)
    {
        var endpoints = new List<ApiEndpoint>
        {
            new() { Path = "/api/users", Method = "GET", Summary = "List users", Module = "Identity", Tags = new List<string> { "Users" }, RequiresAuthentication = true },
            new() { Path = "/api/users", Method = "POST", Summary = "Create user", Module = "Identity", Tags = new List<string> { "Users" }, RequiresAuthentication = true },
            new() { Path = "/api/users/{id}", Method = "GET", Summary = "Get user by ID", Module = "Identity", Tags = new List<string> { "Users" }, RequiresAuthentication = true },
            new() { Path = "/api/users/{id}", Method = "PUT", Summary = "Update user", Module = "Identity", Tags = new List<string> { "Users" }, RequiresAuthentication = true },
            new() { Path = "/api/users/{id}", Method = "DELETE", Summary = "Delete user", Module = "Identity", Tags = new List<string> { "Users" }, RequiresAuthentication = true },
            new() { Path = "/api/applications", Method = "GET", Summary = "List applications", Module = "Applications", Tags = new List<string> { "Applications" }, RequiresAuthentication = true },
            new() { Path = "/api/applications", Method = "POST", Summary = "Create application", Module = "Applications", Tags = new List<string> { "Applications" }, RequiresAuthentication = true },
            new() { Path = "/api/roles", Method = "GET", Summary = "List roles", Module = "Authorization", Tags = new List<string> { "Roles" }, RequiresAuthentication = true },
            new() { Path = "/api/roles", Method = "POST", Summary = "Create role", Module = "Authorization", Tags = new List<string> { "Roles" }, RequiresAuthentication = true },
            new() { Path = "/api/tenants", Method = "GET", Summary = "List tenants", Module = "Tenants", Tags = new List<string> { "Tenants" }, RequiresAuthentication = true },
            new() { Path = "/api/tenants", Method = "POST", Summary = "Create tenant", Module = "Tenants", Tags = new List<string> { "Tenants" }, RequiresAuthentication = true },
            new() { Path = "/api/audit/events", Method = "GET", Summary = "List audit events", Module = "Audit", Tags = new List<string> { "Audit" }, RequiresAuthentication = true },
            new() { Path = "/api/global/platform/version", Method = "GET", Summary = "Get platform version", Module = "Platform", Tags = new List<string> { "Platform" }, RequiresAuthentication = true },
            new() { Path = "/api/global/platform/health", Method = "GET", Summary = "Get platform health", Module = "Platform", Tags = new List<string> { "Platform" }, RequiresAuthentication = true },
            new() { Path = "/api/global/platform/migrations", Method = "GET", Summary = "List migrations", Module = "Platform", Tags = new List<string> { "Platform" }, RequiresAuthentication = true },
            new() { Path = "/api/global/platform/diagnostics", Method = "GET", Summary = "Get platform diagnostics", Module = "Platform", Tags = new List<string> { "Platform" }, RequiresAuthentication = true }
        };

        if (!string.IsNullOrEmpty(module))
        {
            endpoints = endpoints.Where(e => e.Module.Equals(module, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return await Task.FromResult(endpoints);
    }

    public async Task<ApiEndpointDetails> GetEndpointDetailsAsync(string path, string method, CancellationToken cancellationToken = default)
    {
        var endpoints = await GetEndpointsAsync(cancellationToken: cancellationToken);
        var endpoint = endpoints.FirstOrDefault(e =>
            e.Path.Equals(path, StringComparison.OrdinalIgnoreCase) &&
            e.Method.Equals(method, StringComparison.OrdinalIgnoreCase));

        if (endpoint == null)
        {
            return new ApiEndpointDetails
            {
                Path = path,
                Method = method,
                Summary = "Endpoint not found"
            };
        }

        return new ApiEndpointDetails
        {
            Path = endpoint.Path,
            Method = endpoint.Method,
            Summary = endpoint.Summary,
            Description = $"Detailed description for {endpoint.Summary}",
            Parameters = new List<ApiParameter>(),
            Responses = new Dictionary<string, ApiResponse>
            {
                ["200"] = new ApiResponse { Description = "Success" },
                ["401"] = new ApiResponse { Description = "Unauthorized" },
                ["403"] = new ApiResponse { Description = "Forbidden" },
                ["500"] = new ApiResponse { Description = "Internal Server Error" }
            },
            RequiredPermissions = new List<string> { $"{endpoint.Module.ToLower()}:read" }
        };
    }

    private string GenerateOpenApiJson()
    {
        return @"{
  ""openapi"": ""3.0.3"",
  ""info"": {
    ""title"": ""OneSign Identity Platform API"",
    ""description"": ""Comprehensive API for the OneSign Identity Platform"",
    ""version"": ""1.0.0""
  },
  ""servers"": [
    {
      ""url"": ""https://api.onesign.io"",
      ""description"": ""Production server""
    }
  ],
  ""paths"": {}
}";
    }
}
