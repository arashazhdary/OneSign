using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Queries;

public class GetTenantQuotaStatusQueryHandler : IRequestHandler<GetTenantQuotaStatusQuery, Result<TenantQuotaStatusDto>>
{
    private readonly IMediator _mediator;

    public GetTenantQuotaStatusQueryHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<Result<TenantQuotaStatusDto>> Handle(GetTenantQuotaStatusQuery request, CancellationToken cancellationToken)
    {
        // Reuse GetTenantUsageSummaryQuery to get quota status
        var summaryResult = await _mediator.Send(new GetTenantUsageSummaryQuery { TenantId = request.TenantId }, cancellationToken);

        if (!summaryResult.IsSuccess || summaryResult.Data?.QuotaStatus == null)
        {
            return Result.Failure<TenantQuotaStatusDto>(summaryResult.ErrorCode ?? "QUOTA_STATUS_ERROR",
                summaryResult.ErrorMessage ?? "Failed to retrieve quota status");
        }

        return Result.Success(summaryResult.Data.QuotaStatus);
    }
}
