using MediatR;
using Onesign.Modules.AccessRequests.Application.Commands;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Handlers;

public class CancelAccessRequestCommandHandler : IRequestHandler<CancelAccessRequestCommand, Result>
{
    private readonly IAccessRequestRepository _repository;
    private readonly IAccessRequestWorkflowEngine _workflowEngine;

    public CancelAccessRequestCommandHandler(
        IAccessRequestRepository repository,
        IAccessRequestWorkflowEngine workflowEngine)
    {
        _repository = repository;
        _workflowEngine = workflowEngine;
    }

    public async Task<Result> Handle(CancelAccessRequestCommand request, CancellationToken cancellationToken)
    {
        var accessRequest = await _repository.GetByIdAsync(request.RequestId, cancellationToken);
        if (accessRequest == null || accessRequest.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Access request not found");

        if (accessRequest.Status != RequestStatus.Pending)
            return Result.Failure("InvalidState", "Only pending requests can be cancelled");

        if (accessRequest.RequesterId != request.CancelledBy)
            return Result.Failure("Unauthorized", "Only the requester can cancel this request");

        await _workflowEngine.CancelWorkflowAsync(accessRequest, request.Reason, cancellationToken);

        accessRequest.Status = RequestStatus.Cancelled;
        accessRequest.ReviewedAt = DateTime.UtcNow;
        accessRequest.ReviewedBy = request.CancelledBy;
        accessRequest.ReviewComment = request.Reason;

        await _repository.UpdateAsync(accessRequest, cancellationToken);
        return Result.Success();
    }
}
