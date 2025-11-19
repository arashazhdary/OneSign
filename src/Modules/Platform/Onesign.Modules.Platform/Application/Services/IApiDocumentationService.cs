using Onesign.Modules.Platform.Application.Commands;

namespace Onesign.Modules.Platform.Application.Services;

public interface IApiDocumentationService
{
    Task<ApiDocumentationResultDto> GenerateDocumentationAsync(string? outputFormat, bool includeExamples, List<string>? includeModules, CancellationToken cancellationToken = default);
    Task<string> GetOpenApiSpecificationAsync(CancellationToken cancellationToken = default);
    Task<List<string>> GetAvailableModulesAsync(CancellationToken cancellationToken = default);
}
