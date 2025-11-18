using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Queries;

public class GetSecuritySignalsQueryHandler : IRequestHandler<GetSecuritySignalsQuery, Result<List<SecuritySignalDto>>>
{
    private readonly ISecuritySignalRepository _repository;

    public GetSecuritySignalsQueryHandler(ISecuritySignalRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<SecuritySignalDto>>> Handle(GetSecuritySignalsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<SecuritySignal> signals;

        if (request.UserId.HasValue)
        {
            signals = await _repository.GetByUserAsync(request.TenantId, request.UserId.Value, cancellationToken);
        }
        else if (request.SignalType.HasValue)
        {
            signals = await _repository.GetByTypeAsync(request.TenantId, request.SignalType.Value, cancellationToken);
        }
        else
        {
            signals = await _repository.GetByTenantAsync(request.TenantId, request.Limit, cancellationToken);
        }

        var dtos = signals.Select(s => new SecuritySignalDto
        {
            Id = s.Id,
            TenantId = s.TenantId,
            UserId = s.UserId,
            SessionId = s.SessionId,
            SignalType = s.SignalType,
            RiskScore = s.RiskScore,
            DetailsJson = s.DetailsJson,
            DetectedAt = s.DetectedAt,
            ProcessedAt = s.ProcessedAt,
            ActionTaken = s.ActionTaken
        }).ToList();

        return Result.Success(dtos);
    }
}
