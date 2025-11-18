using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Modules.AccessRequests.Application.Queries;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class GetPendingApprovalsQueryHandler : IRequestHandler<GetPendingApprovalsQuery, Result<List<AccessRequestDto>>>
{
    private readonly IAccessRequestRepository _repository;

    public GetPendingApprovalsQueryHandler(IAccessRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<AccessRequestDto>>> Handle(GetPendingApprovalsQuery request, CancellationToken cancellationToken)
    {
        var requests = await _repository.GetPendingForApproverAsync(request.TenantId, request.ApproverId, cancellationToken);
        var dtos = requests.Select(MapToDto).ToList();
        return Result.Success(dtos);
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
