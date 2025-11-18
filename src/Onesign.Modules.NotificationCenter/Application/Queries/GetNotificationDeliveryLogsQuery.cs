using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Shared.Pagination;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Queries;

public class GetNotificationDeliveryLogsQuery : IRequest<Result<PagedResult<NotificationDeliveryLogDto>>>
{
    public Guid TenantId { get; set; }
    public Guid? OutboxItemId { get; set; }
    public string? Channel { get; set; }
    public string? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
