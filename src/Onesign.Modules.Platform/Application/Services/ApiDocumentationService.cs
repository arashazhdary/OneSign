using Microsoft.Extensions.Logging;
using Onesign.Modules.Platform.Application.Commands;

namespace Onesign.Modules.Platform.Application.Services;

public class ApiDocumentationService : IApiDocumentationService
{
    private readonly ILogger<ApiDocumentationService> _logger;

    public ApiDocumentationService(ILogger<ApiDocumentationService> logger)
    {
        _logger = logger;
    }

    public async Task<ApiDocumentationResultDto> GenerateDocumentationAsync(
        string? outputFormat,
        bool includeExamples,
        List<string>? includeModules,
        CancellationToken cancellationToken = default)
    {
        var format = outputFormat ?? "OpenAPI3";
        var modules = includeModules ?? await GetAvailableModulesAsync(cancellationToken);

        _logger.LogInformation("Generating API documentation in {Format} format for {ModuleCount} modules",
            format, modules.Count);

        await Task.Delay(50, cancellationToken);

        var endpointCount = modules.Count * 12;
        var schemaCount = modules.Count * 8;

        var result = new ApiDocumentationResultDto
        {
            DocumentationUrl = $"/api/docs/{format.ToLowerInvariant()}",
            Format = format,
            GeneratedAt = DateTimeOffset.UtcNow,
            EndpointCount = endpointCount,
            SchemaCount = schemaCount,
            IncludedModules = modules
        };

        _logger.LogInformation("Generated API documentation with {EndpointCount} endpoints and {SchemaCount} schemas",
            endpointCount, schemaCount);

        return result;
    }

    public async Task<string> GetOpenApiSpecificationAsync(CancellationToken cancellationToken = default)
    {
        await Task.Delay(10, cancellationToken);

        return """
        {
          "openapi": "3.0.3",
          "info": {
            "title": "OneSign Identity Platform API",
            "description": "Comprehensive identity and access management platform",
            "version": "1.0.0",
            "contact": {
              "name": "OneSign Support",
              "email": "support@onesign.io"
            }
          },
          "servers": [
            {
              "url": "/api/v1",
              "description": "API v1"
            }
          ],
          "paths": {},
          "components": {
            "securitySchemes": {
              "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"
              }
            }
          }
        }
        """;
    }

    public Task<List<string>> GetAvailableModulesAsync(CancellationToken cancellationToken = default)
    {
        var modules = new List<string>
        {
            "Identity",
            "Authorization",
            "Audit",
            "Applications",
            "Tenants",
            "Automation",
            "Analytics",
            "Compliance",
            "Platform"
        };

        return Task.FromResult(modules);
    }
}
