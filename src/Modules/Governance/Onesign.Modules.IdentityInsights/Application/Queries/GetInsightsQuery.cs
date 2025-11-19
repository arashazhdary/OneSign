using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityInsights.Application.Queries;

public class GetInsightsQuery : IRequest<Result<List<InsightDto>>>
{
    public Guid TenantId { get; set; }
    public string? Type { get; set; }
    public string? Severity { get; set; }
    public string? Status { get; set; }
}

public class InsightDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string ScopeType { get; set; } = string.Empty;
    public Guid? ScopeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
