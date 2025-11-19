using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Commands;

public class AssignPolicyCommandHandler : IRequestHandler<AssignPolicyCommand, Result<Guid>>
{
    private readonly IPolicyDefinitionRepository _policyRepository;
    private readonly IPolicyAssignmentRepository _assignmentRepository;
    private readonly OnesignDbContext _dbContext;

    public AssignPolicyCommandHandler(
        IPolicyDefinitionRepository policyRepository,
        IPolicyAssignmentRepository assignmentRepository,
        OnesignDbContext dbContext)
    {
        _policyRepository = policyRepository;
        _assignmentRepository = assignmentRepository;
        _dbContext = dbContext;
    }

    public async Task<Result<Guid>> Handle(AssignPolicyCommand request, CancellationToken cancellationToken)
    {
        // Verify policy exists
        var policy = await _policyRepository.GetByIdAsync(request.PolicyDefinitionId, cancellationToken);
        if (policy == null)
            return Result.Failure<Guid>("Policy not found");

        if (policy.TenantId != request.TenantId)
            return Result.Failure<Guid>("Policy does not belong to this tenant");

        // Get or create policy target
        var target = await _dbContext.Set<PolicyTargetEntity>()
            .FirstOrDefaultAsync(x => x.TenantId == request.TenantId &&
                                     x.TargetType == request.TargetType &&
                                     x.TargetKey == request.TargetKey, cancellationToken);

        if (target == null)
        {
            target = new PolicyTargetEntity
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                TargetType = request.TargetType,
                TargetKey = request.TargetKey,
                TargetName = request.TargetName,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Set<PolicyTargetEntity>().Add(target);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // Create assignment
        var assignment = new PolicyAssignment
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            PolicyDefinitionId = request.PolicyDefinitionId,
            PolicyTargetId = target.Id,
            Order = request.Order,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _assignmentRepository.AddAsync(assignment, cancellationToken);
        return Result.Success(created.Id);
    }
}
