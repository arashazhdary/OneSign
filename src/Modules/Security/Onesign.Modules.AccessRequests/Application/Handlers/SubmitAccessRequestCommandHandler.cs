using MediatR;
using Onesign.Modules.AccessRequests.Application.Commands;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class SubmitAccessRequestCommandHandler : IRequestHandler<SubmitAccessRequestCommand, Result<AccessRequestDto>>
{
    private readonly IAccessRequestRepository _repository;
    private readonly IAccessRequestWorkflowEngine _workflowEngine;

    public SubmitAccessRequestCommandHandler(
        IAccessRequestRepository repository,
        IAccessRequestWorkflowEngine workflowEngine)
    {
        _repository = repository;
        _workflowEngine = workflowEngine;
    }

    public async Task<Result<AccessRequestDto>> Handle(SubmitAccessRequestCommand request, CancellationToken cancellationToken)
    {
        var accessRequest = new AccessRequest
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            RequesterId = request.RequesterId,
            RequesterName = request.RequesterName,
            Status = RequestStatus.Pending,
            Justification = request.Justification,
            CreatedAt = DateTime.UtcNow,
            Items = request.Items.Select(i => new AccessRequestItem
            {
                Id = Guid.NewGuid(),
                AccessType = Enum.Parse<AccessType>(i.AccessType, true),
                TargetId = i.TargetId,
                TargetName = i.TargetName,
                DurationMinutes = i.DurationMinutes,
                Status = RequestStatus.Pending
            }).ToList()
        };

        await _repository.AddAsync(accessRequest, cancellationToken);
        await _workflowEngine.InitializeWorkflowAsync(accessRequest, cancellationToken);

        var dto = MapToDto(accessRequest);
        return Result.Success(dto);
    }

    private static AccessRequestDto MapToDto(AccessRequest request) => new()
    {
        Id = request.Id,
        RequesterId = request.RequesterId,
        RequesterName = request.RequesterName,
        Status = request.Status.ToString(),
        Justification = request.Justification,
        CreatedAt = request.CreatedAt,
        Items = request.Items.Select(i => new AccessRequestItemDto
        {
            Id = i.Id,
            AccessType = i.AccessType.ToString(),
            TargetId = i.TargetId,
            TargetName = i.TargetName,
            DurationMinutes = i.DurationMinutes,
            Status = i.Status.ToString()
        }).ToList(),
        ApprovalSteps = request.ApprovalSteps.Select(s => new ApprovalStepDto
        {
            Id = s.Id,
            StepNumber = s.StepNumber,
            ApproverId = s.ApproverId,
            ApproverName = s.ApproverName,
            Action = s.Action?.ToString(),
            Comment = s.Comment,
            ActionAt = s.ActionAt
        }).ToList()
    };
}
