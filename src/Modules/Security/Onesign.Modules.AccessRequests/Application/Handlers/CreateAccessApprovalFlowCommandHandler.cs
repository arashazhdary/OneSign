using System.Text.Json;
using MediatR;
using Onesign.Modules.AccessRequests.Application.Commands;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class CreateAccessApprovalFlowCommandHandler : IRequestHandler<CreateAccessApprovalFlowCommand, Result<AccessApprovalFlowDto>>
{
    private readonly IAccessApprovalFlowRepository _repository;

    public CreateAccessApprovalFlowCommandHandler(IAccessApprovalFlowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AccessApprovalFlowDto>> Handle(CreateAccessApprovalFlowCommand request, CancellationToken cancellationToken)
    {
        var steps = request.Steps.Select(s => new ApprovalFlowStep
        {
            StepNumber = s.StepNumber,
            ApproverType = s.ApproverType,
            ApproverId = s.ApproverId,
            ApproverRole = s.ApproverRole,
            IsRequired = s.IsRequired,
            TimeoutHours = s.TimeoutHours
        }).ToList();

        var flow = new AccessApprovalFlow
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name,
            Description = request.Description,
            AccessType = request.AccessType,
            TargetApplication = request.TargetApplication,
            StepsJson = JsonSerializer.Serialize(steps),
            RequireAllApprovals = request.RequireAllApprovals,
            IsEnabled = request.IsEnabled,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(flow, cancellationToken);

        var dto = MapToDto(flow);
        return Result.Success(dto);
    }

    private static AccessApprovalFlowDto MapToDto(AccessApprovalFlow flow)
    {
        var steps = JsonSerializer.Deserialize<List<ApprovalFlowStep>>(flow.StepsJson) ?? new();

        return new AccessApprovalFlowDto
        {
            Id = flow.Id,
            TenantId = flow.TenantId,
            Name = flow.Name,
            Description = flow.Description,
            AccessType = flow.AccessType,
            TargetApplication = flow.TargetApplication,
            Steps = steps.Select(s => new ApprovalFlowStepDto
            {
                StepNumber = s.StepNumber,
                ApproverType = s.ApproverType,
                ApproverId = s.ApproverId,
                ApproverRole = s.ApproverRole,
                IsRequired = s.IsRequired,
                TimeoutHours = s.TimeoutHours
            }).ToList(),
            RequireAllApprovals = flow.RequireAllApprovals,
            IsEnabled = flow.IsEnabled,
            CreatedAt = flow.CreatedAt,
            UpdatedAt = flow.UpdatedAt
        };
    }
}
