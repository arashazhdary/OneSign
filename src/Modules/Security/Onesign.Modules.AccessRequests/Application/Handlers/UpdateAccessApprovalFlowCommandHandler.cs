using System.Text.Json;
using MediatR;
using Onesign.Modules.AccessRequests.Application.Commands;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class UpdateAccessApprovalFlowCommandHandler : IRequestHandler<UpdateAccessApprovalFlowCommand, Result<AccessApprovalFlowDto>>
{
    private readonly IAccessApprovalFlowRepository _repository;

    public UpdateAccessApprovalFlowCommandHandler(IAccessApprovalFlowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AccessApprovalFlowDto>> Handle(UpdateAccessApprovalFlowCommand request, CancellationToken cancellationToken)
    {
        var flow = await _repository.GetByIdAsync(request.FlowId, cancellationToken);
        if (flow == null || flow.TenantId != request.TenantId)
            return Result.Failure<AccessApprovalFlowDto>("NotFound", "Approval flow not found");

        if (request.Name != null)
            flow.Name = request.Name;
        if (request.Description != null)
            flow.Description = request.Description;
        if (request.Steps != null)
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
            flow.StepsJson = JsonSerializer.Serialize(steps);
        }
        if (request.RequireAllApprovals.HasValue)
            flow.RequireAllApprovals = request.RequireAllApprovals.Value;
        if (request.IsEnabled.HasValue)
            flow.IsEnabled = request.IsEnabled.Value;

        flow.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(flow, cancellationToken);

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
