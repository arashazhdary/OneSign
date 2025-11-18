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
            UserId = s.UserId,
            UserDisplayName = s.UserDisplayName,
            PrivilegedRolesJson = s.PrivilegedRolesJson,
            StartedAt = s.StartedAt,
            LastActivityAt = s.LastActivityAt,
            EndedAt = s.EndedAt,
            IpAddress = s.IpAddress,
            IsActive = s.IsActive
        }).ToList();

        return Result.Success(dtos);
    }
}
