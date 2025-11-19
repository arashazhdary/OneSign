using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityInsights.Application.DTOs;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Enums;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityInsights.Application.Commands;

public class CreateManualInsightCommand : IRequest<Result<InsightDetailDto>>
{
    public Guid TenantId { get; set; }
    public InsightType Type { get; set; }
    public InsightSeverity Severity { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid? ScopeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string MessageKey { get; set; } = string.Empty;
    public Dictionary<string, object>? Data { get; set; }
}

public class CreateManualInsightCommandHandler : IRequestHandler<CreateManualInsightCommand, Result<InsightDetailDto>>
{
    private readonly IInsightRepository _repository;

    public CreateManualInsightCommandHandler(IInsightRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<InsightDetailDto>> Handle(CreateManualInsightCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return Result.Failure<InsightDetailDto>("InvalidTitle", "Insight title is required");

        if (string.IsNullOrWhiteSpace(request.ScopeType))
            return Result.Failure<InsightDetailDto>("InvalidScopeType", "Scope type is required");

        var insight = new Insight
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Type = request.Type,
            Severity = request.Severity,
            ScopeType = request.ScopeType,
            ScopeId = request.ScopeId,
            Title = request.Title,
            MessageKey = request.MessageKey,
            DataJson = request.Data != null ? JsonSerializer.Serialize(request.Data) : "{}",
            Status = InsightStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(insight, cancellationToken);

        var dto = new InsightDetailDto
        {
            Id = insight.Id,
            Type = insight.Type.ToString(),
            Severity = insight.Severity.ToString(),
            ScopeType = insight.ScopeType,
            ScopeId = insight.ScopeId,
            Title = insight.Title,
            MessageKey = insight.MessageKey,
            DataJson = insight.DataJson,
            Status = insight.Status.ToString(),
            CreatedAt = insight.CreatedAt
        };

        return Result.Success(dto);
    }
}
