using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Modules.AccessRequests.Application.Queries;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class GetAccessRequestDetailsQueryHandler : IRequestHandler<GetAccessRequestDetailsQuery, Result<AccessRequestDto>>
{
    private readonly IAccessRequestRepository _repository;

    public GetAccessRequestDetailsQueryHandler(IAccessRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AccessRequestDto>> Handle(GetAccessRequestDetailsQuery request, CancellationToken cancellationToken)
    {
        var accessRequest = await _repository.GetByIdAsync(request.RequestId, cancellationToken);
        if (accessRequest == null || accessRequest.TenantId != request.TenantId)
            return Result.Failure<AccessRequestDto>("NotFound", "Access request not found");

        var dto = new AccessRequestDto
        {
            Id = accessRequest.Id,
            RequesterId = accessRequest.RequesterId,
            RequesterName = accessRequest.RequesterName,
            Status = accessRequest.Status.ToString(),
            Justification = accessRequest.Justification,
            CreatedAt = accessRequest.CreatedAt,
            Items = accessRequest.Items.Select(i => new AccessRequestItemDto
            {
                Id = i.Id,
                AccessType = i.AccessType.ToString(),
                TargetId = i.TargetId,
                TargetName = i.TargetName,
                DurationMinutes = i.DurationMinutes,
                Status = i.Status.ToString()
            }).ToList(),
            ApprovalSteps = accessRequest.ApprovalSteps.Select(s => new ApprovalStepDto
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

        return Result.Success(dto);
    }
}
