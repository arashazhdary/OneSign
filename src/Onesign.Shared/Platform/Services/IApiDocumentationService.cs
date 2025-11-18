namespace Onesign.Shared.Platform.Services;

public interface IApiDocumentationService
{
    Task<OpenApiSpecification> GetOpenApiSpecificationAsync(CancellationToken cancellationToken = default);
    Task<OpenApiSpecification> GenerateDocumentationAsync(GenerateDocumentationRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ApiEndpoint>> GetEndpointsAsync(string? module = null, CancellationToken cancellationToken = default);
    Task<ApiEndpointDetails> GetEndpointDetailsAsync(string path, string method, CancellationToken cancellationToken = default);
}

public class OpenApiSpecification
{
    public string Version { get; set; } = "3.0.3";
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SpecificationJson { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public int EndpointCount { get; set; }
    public int SchemaCount { get; set; }
}

public class GenerateDocumentationRequest
{
    public bool IncludeExamples { get; set; } = true;
    public bool IncludeDeprecated { get; set; } = false;
    public List<string>? ModulesToInclude { get; set; }
    public string? OutputFormat { get; set; }
}

public class ApiEndpoint
{
    public string Path { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public bool RequiresAuthentication { get; set; }
    public bool IsDeprecated { get; set; }
}

public class ApiEndpointDetails
{
    public string Path { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<ApiParameter> Parameters { get; set; } = new();
    public ApiRequestBody? RequestBody { get; set; }
    public Dictionary<string, ApiResponse> Responses { get; set; } = new();
    public List<string> RequiredPermissions { get; set; } = new();
    public RateLimitInfo? RateLimit { get; set; }
}

public class ApiParameter
{
    public string Name { get; set; } = string.Empty;
    public string In { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool Required { get; set; }
    public string? Description { get; set; }
    public string? Example { get; set; }
}

public class ApiRequestBody
{
    public string ContentType { get; set; } = "application/json";
    public string SchemaRef { get; set; } = string.Empty;
    public string? Example { get; set; }
    public bool Required { get; set; }
}

public class ApiResponse
{
    public string Description { get; set; } = string.Empty;
    public string? SchemaRef { get; set; }
    public string? Example { get; set; }
}

public class RateLimitInfo
{
    public int RequestsPerMinute { get; set; }
    public int BurstLimit { get; set; }
}
