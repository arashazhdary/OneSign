using MediatR;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Modules.Security.Application.Commands;

public class RecordRiskEventCommandHandler : IRequestHandler<RecordRiskEventCommand, Unit>
{
    private readonly IRiskEventRepository _repository;

    public RecordRiskEventCommandHandler(IRiskEventRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(RecordRiskEventCommand request, CancellationToken cancellationToken)
    {
        var riskEvent = RiskEvent.Create(
            request.UserId,
            request.TenantId,
            (RiskEventType)request.EventType,
            (RiskLevel)request.RiskLevel,
            request.IpAddress ?? string.Empty,
            request.UserAgent ?? string.Empty,
            request.Location ?? string.Empty,
            request.Details ?? string.Empty
        );

        await _repository.AddAsync(riskEvent, cancellationToken);
        return Unit.Value;
    }
}
