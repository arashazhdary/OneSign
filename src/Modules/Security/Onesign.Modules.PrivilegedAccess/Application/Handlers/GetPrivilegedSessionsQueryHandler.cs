using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Modules.PrivilegedAccess.Application.Queries;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class GetPrivilegedSessionsQueryHandler : IRequestHandler<GetPrivilegedSessionsQuery, Result<List<PrivilegedSessionDto>>>
{
    private readonly IPrivilegedSessionRepository _repository;

    public GetPrivilegedSessionsQueryHandler(IPrivilegedSessionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<PrivilegedSessionDto>>> Handle(GetPrivilegedSessionsQuery request, CancellationToken cancellationToken)
    {
        var sessions = request.ActiveOnly
            ? await _repository.GetActiveSessionsAsync(request.TenantId, cancellationToken)
            : await _repository.GetActiveSessionsAsync(request.TenantId, cancellationToken);

        var dtos = sessions.Select(s => new PrivilegedSessionDto
        {
            Id = s.Id,
            TenantId = s.TenantId,
            UserId = s.UserId,
            SessionType = "Privileged", // Default session type
            StartedAt = s.StartedAt,
            EndedAt = s.EndedAt,
            SourceIp = s.IpAddress,
            Status = s.IsActive ? "Active" : "Ended"
        }).ToList();

        return Result.Success(dtos);
    }
}
