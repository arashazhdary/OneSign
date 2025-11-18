using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Modules.AdaptiveSecurity.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Commands;

public class ProcessSecuritySignalCommandHandler : IRequestHandler<ProcessSecuritySignalCommand, Result<SecuritySignalDto>>
{
    private readonly ISecuritySignalRepository _signalRepository;
    private readonly ISecuritySignalProcessor _signalProcessor;

    public ProcessSecuritySignalCommandHandler(
        ISecuritySignalRepository signalRepository,
        ISecuritySignalProcessor signalProcessor)
    {
        _signalRepository = signalRepository;
        _signalProcessor = signalProcessor;
    }

    public async Task<Result<SecuritySignalDto>> Handle(ProcessSecuritySignalCommand request, CancellationToken cancellationToken)
    {
        var signal = new SecuritySignal
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            UserId = request.UserId,
            SessionId = request.SessionId,
            SignalType = request.SignalType,
            RiskScore = request.RiskScore,
            DetailsJson = request.DetailsJson,
            DetectedAt = DateTime.UtcNow
        };

        await _signalRepository.AddAsync(signal, cancellationToken);
        await _signalProcessor.ProcessSignalAsync(signal, cancellationToken);

        var dto = new SecuritySignalDto
        {
            Id = signal.Id,
            TenantId = signal.TenantId,
            UserId = signal.UserId,
            SessionId = signal.SessionId,
            SignalType = signal.SignalType,
            RiskScore = signal.RiskScore,
            DetailsJson = signal.DetailsJson,
            DetectedAt = signal.DetectedAt,
            ProcessedAt = signal.ProcessedAt,
            ActionTaken = signal.ActionTaken
        };

        return Result.Success(dto);
    }
}
