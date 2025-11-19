using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Platform.Application.Commands;

public class GenerateApiDocumentationCommand : IRequest<Result<ApiDocumentationResultDto>>
{
    public string? OutputFormat { get; set; }
    public bool IncludeExamples { get; set; } = true;
    public List<string>? IncludeModules { get; set; }
}

public class ApiDocumentationResultDto
{
    public string DocumentationUrl { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public DateTimeOffset GeneratedAt { get; set; }
    public int EndpointCount { get; set; }
    public int SchemaCount { get; set; }
    public List<string> IncludedModules { get; set; } = new();
}
