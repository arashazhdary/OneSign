using MediatR;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Commands;

public class DeletePolicyCommandHandler : IRequestHandler<DeletePolicyCommand, Result>
{
    private readonly IPolicyDefinitionRepository _policyRepository;
    private readonly IPolicyAssignmentRepository _assignmentRepository;

    public DeletePolicyCommandHandler(
        IPolicyDefinitionRepository policyRepository,
        IPolicyAssignmentRepository assignmentRepository)
    {
        _policyRepository = policyRepository;
        _assignmentRepository = assignmentRepository;
    }

    public async Task<Result> Handle(DeletePolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = await _policyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (policy == null)
            return Result.Failure("Policy not found");

        // Check if policy has assignments
        var assignments = await _assignmentRepository.GetByPolicyIdAsync(request.Id, cancellationToken);
        if (assignments.Any())
        {
            return Result.Failure($"Cannot delete policy. It has {assignments.Count} assignment(s). Remove assignments first.");
        }

        await _policyRepository.DeleteAsync(request.Id, cancellationToken);
        return Result.Success();
    }
}
