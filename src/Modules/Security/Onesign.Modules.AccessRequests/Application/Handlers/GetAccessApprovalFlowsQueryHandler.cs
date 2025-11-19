using System.Text.Json;
using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Modules.AccessRequests.Application.Queries;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class GetAccessApprovalFlowsQueryHandler : IRequestHandler<GetAccessApprovalFlowsQuery, Result<List<AccessApprovalFlowDto>>>
{
    private readonly IAccessApprovalFlowRepository _repository;

    public GetAccessApprovalFlowsQueryHandler(IAccessApprovalFlowRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<AccessApprovalFlowDto>>> Handle(GetAccessApprovalFlowsQuery request, CancellationToken cancellationToken)
    {
        var flows = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        if (!string.IsNullOrEmpty(request.AccessType))
        {
            flows = flows.Where(f => f.AccessType == request.AccessType).ToList();
        }

        var dtos = flows.Select(MapToDto).ToList();
        return Result.Success(dtos);
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
