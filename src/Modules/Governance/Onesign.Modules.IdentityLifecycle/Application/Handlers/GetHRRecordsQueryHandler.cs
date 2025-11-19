using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Application.Queries;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class GetHRRecordsQueryHandler : IRequestHandler<GetHRRecordsQuery, Result<List<HRIdentityRecordDto>>>
{
    private readonly IHRIdentityRecordRepository _repository;

    public GetHRRecordsQueryHandler(IHRIdentityRecordRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<HRIdentityRecordDto>>> Handle(GetHRRecordsQuery request, CancellationToken cancellationToken)
    {
        var records = await _repository.GetByTenantAsync(request.TenantId, cancellationToken);

        var dtos = records.Select(r => new HRIdentityRecordDto
        {
            Id = r.Id,
            ExternalEmployeeId = r.ExternalEmployeeId,
            FirstName = r.FirstName,
            LastName = r.LastName,
            Email = r.Email,
            OrgUnitCode = r.OrgUnitCode,
            JobRole = r.JobRole,
            ManagerEmployeeId = r.ManagerEmployeeId,
            Status = r.Status.ToString(),
            StartDate = r.StartDate,
            EndDate = r.EndDate,
            LastSyncedAt = r.LastSyncedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
