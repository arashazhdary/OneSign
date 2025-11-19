using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Modules.AccessRequests.Application.Queries;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class GetAccessRequestsForApproverQueryHandler : IRequestHandler<GetAccessRequestsForApproverQuery, Result<List<AccessRequestDto>>>
{
    private readonly IAccessRequestRepository _repository;

    public GetAccessRequestsForApproverQueryHandler(IAccessRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<AccessRequestDto>>> Handle(GetAccessRequestsForApproverQuery request, CancellationToken cancellationToken)
    {
        var requests = await _repository.GetByApproverIdAsync(request.TenantId, request.ApproverId, cancellationToken);

        if (request.PendingOnly)
        {
            requests = requests.Where(r => r.ApprovalSteps.Any(s => s.ApproverId == request.ApproverId && s.Action == null)).ToList();
        }

        var dtos = requests.Select(r => new AccessRequestDto
        {
            Id = r.Id,
            RequesterId = r.RequesterId,
            RequesterName = r.RequesterName,
            Status = r.Status.ToString(),
            Justification = r.Justification,
            CreatedAt = r.CreatedAt,
            Items = r.Items.Select(i => new AccessRequestItemDto
            {
                Id = i.Id,
                AccessType = i.AccessType.ToString(),
                TargetId = i.TargetId,
                TargetName = i.TargetName,
                DurationMinutes = i.DurationMinutes,
                Status = i.Status.ToString()
            }).ToList(),
            ApprovalSteps = r.ApprovalSteps.Select(s => new ApprovalStepDto
            {
                Id = s.Id,
                StepNumber = s.StepNumber,
                ApproverId = s.ApproverId,
                ApproverName = s.ApproverName,
                Action = s.Action?.ToString(),
                Comment = s.Comment,
                ActionAt = s.ActionAt
            }).ToList()
        }).ToList();

        return Result.Success(dtos);
    }
}
