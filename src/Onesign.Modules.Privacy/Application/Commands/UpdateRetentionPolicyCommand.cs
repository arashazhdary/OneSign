using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Privacy.Application.Commands;

public class UpdateRetentionPolicyCommand : IRequest<Result<DataRetentionPolicyDto>>
{
    public Guid TenantId { get; set; }
    public Guid PolicyId { get; set; }
    public DataCategory Category { get; set; }
    public int RetentionPeriodDays { get; set; }
    public bool HardDeleteAfter { get; set; }
    public bool Enabled { get; set; }
}

public class UpdateRetentionPolicyCommandHandler : IRequestHandler<UpdateRetentionPolicyCommand, Result<DataRetentionPolicyDto>>
{
    private readonly IDataRetentionPolicyRepository _repository;
    private readonly ILogger<UpdateRetentionPolicyCommandHandler> _logger;

    public UpdateRetentionPolicyCommandHandler(
        IDataRetentionPolicyRepository repository,
        ILogger<UpdateRetentionPolicyCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<DataRetentionPolicyDto>> Handle(UpdateRetentionPolicyCommand request, CancellationToken cancellationToken)
    {
        try
        {
            DataRetentionPolicy policy;

            if (request.PolicyId != Guid.Empty)
            {
                policy = await _repository.GetByIdAsync(request.PolicyId, cancellationToken);
                if (policy == null)
                {
                    return Result.Failure<DataRetentionPolicyDto>("POLICY_NOT_FOUND", "Retention policy not found");
                }

                policy.RetentionPeriodDays = request.RetentionPeriodDays;
                policy.HardDeleteAfter = request.HardDeleteAfter;
                policy.Enabled = request.Enabled;
                policy.UpdatedAt = DateTime.UtcNow;

                await _repository.UpdateAsync(policy, cancellationToken);
                _logger.LogInformation("Updated retention policy {PolicyId} for tenant {TenantId}", policy.Id, policy.TenantId);
            }
            else
            {
                var existingPolicy = await _repository.GetByCategoryAsync(request.TenantId, request.Category, cancellationToken);

                if (existingPolicy != null)
                {
                    existingPolicy.RetentionPeriodDays = request.RetentionPeriodDays;
                    existingPolicy.HardDeleteAfter = request.HardDeleteAfter;
                    existingPolicy.Enabled = request.Enabled;
                    existingPolicy.UpdatedAt = DateTime.UtcNow;

                    await _repository.UpdateAsync(existingPolicy, cancellationToken);
                    policy = existingPolicy;
                    _logger.LogInformation("Updated existing retention policy for category {Category} in tenant {TenantId}",
                        request.Category, request.TenantId);
                }
                else
                {
                    policy = new DataRetentionPolicy
                    {
                        Id = Guid.NewGuid(),
                        TenantId = request.TenantId,
                        Category = request.Category,
                        RetentionPeriodDays = request.RetentionPeriodDays,
                        HardDeleteAfter = request.HardDeleteAfter,
                        Enabled = request.Enabled,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _repository.AddAsync(policy, cancellationToken);
                    _logger.LogInformation("Created new retention policy {PolicyId} for category {Category} in tenant {TenantId}",
                        policy.Id, request.Category, request.TenantId);
                }
            }

            var dto = new DataRetentionPolicyDto
            {
                Id = policy.Id,
                TenantId = policy.TenantId,
                DataCategory = policy.Category.ToString(),
                RetentionPeriodDays = policy.RetentionPeriodDays,
                HardDeleteAfter = policy.HardDeleteAfter,
                Enabled = policy.Enabled,
                CreatedAt = policy.CreatedAt,
                UpdatedAt = policy.UpdatedAt
            };

            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update retention policy for tenant {TenantId}", request.TenantId);
            return Result.Failure<DataRetentionPolicyDto>("UPDATE_FAILED", ex.Message);
        }
    }
}
