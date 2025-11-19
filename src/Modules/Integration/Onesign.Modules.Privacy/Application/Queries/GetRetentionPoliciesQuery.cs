using MediatR;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Privacy.Application.Queries;

public class GetRetentionPoliciesQuery : IRequest<Result<List<DataRetentionPolicyDto>>>
{
    public Guid TenantId { get; set; }
    public DataCategory? DataCategory { get; set; }
}

public class GetRetentionPoliciesQueryHandler : IRequestHandler<GetRetentionPoliciesQuery, Result<List<DataRetentionPolicyDto>>>
{
    private readonly IDataRetentionService _retentionService;

    public GetRetentionPoliciesQueryHandler(IDataRetentionService retentionService)
    {
        _retentionService = retentionService;
    }

    public async Task<Result<List<DataRetentionPolicyDto>>> Handle(GetRetentionPoliciesQuery request, CancellationToken cancellationToken)
    {
        var policies = await _retentionService.GetPoliciesAsync(request.TenantId, cancellationToken);

        if (request.DataCategory.HasValue)
        {
            policies = policies.Where(p => p.DataCategory == request.DataCategory.Value);
        }

        var dtos = policies.Select(MapToDto).ToList();

        return Result.Success(dtos);
    }

    private static DataRetentionPolicyDto MapToDto(DataRetentionPolicy policy) => new()
    {
        Id = policy.Id,
        TenantId = policy.TenantId,
        DataCategory = policy.DataCategory.ToString(),
        RetentionPeriodDays = policy.RetentionPeriodDays,
        HardDeleteAfter = policy.HardDeleteAfter,
        Enabled = policy.Enabled,
        CreatedAt = policy.CreatedAt,
        UpdatedAt = policy.UpdatedAt
    };
}
