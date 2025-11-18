using MediatR;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Privacy.Application.Commands;

public class UpdateRetentionPolicyCommand : IRequest<Result<DataRetentionPolicyDto>>
{
    public Guid TenantId { get; set; }
    public Guid PolicyId { get; set; }
    public DataCategory DataCategory { get; set; }
    public int RetentionPeriodDays { get; set; }
    public bool HardDeleteAfter { get; set; }
    public bool Enabled { get; set; }
}

public class UpdateRetentionPolicyCommandHandler : IRequestHandler<UpdateRetentionPolicyCommand, Result<DataRetentionPolicyDto>>
{
    public Task<Result<DataRetentionPolicyDto>> Handle(UpdateRetentionPolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = new DataRetentionPolicy
        {
            Id = request.PolicyId == Guid.Empty ? Guid.NewGuid() : request.PolicyId,
            TenantId = request.TenantId,
            DataCategory = request.DataCategory,
            RetentionPeriodDays = request.RetentionPeriodDays,
            HardDeleteAfter = request.HardDeleteAfter,
            Enabled = request.Enabled,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var dto = new DataRetentionPolicyDto
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

        return Task.FromResult(Result.Success(dto));
    }
}
