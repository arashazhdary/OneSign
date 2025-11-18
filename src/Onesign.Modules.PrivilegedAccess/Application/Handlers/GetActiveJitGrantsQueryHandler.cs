using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Modules.PrivilegedAccess.Application.Queries;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class GetActiveJitGrantsQueryHandler : IRequestHandler<GetActiveJitGrantsQuery, Result<List<JitGrantDto>>>
{
    private readonly IJitGrantRepository _repository;

    public GetActiveJitGrantsQueryHandler(IJitGrantRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<JitGrantDto>>> Handle(GetActiveJitGrantsQuery request, CancellationToken cancellationToken)
    {
        var grants = await _repository.GetActiveByUserAsync(request.TenantId, request.UserId, cancellationToken);

        var dtos = grants.Select(g => new JitGrantDto
        {
            Id = g.Id,
            UserId = g.UserId,
            RoleId = g.RoleId,
            RoleName = g.RoleName,
            GrantedAt = g.GrantedAt,
            ExpiresAt = g.ExpiresAt,
            ApprovedBy = g.ApprovedBy,
            AccessRequestId = g.AccessRequestId,
            Status = g.Status.ToString(),
            Justification = g.Justification
        }).ToList();

        return Result.Success(dtos);
    }
}
