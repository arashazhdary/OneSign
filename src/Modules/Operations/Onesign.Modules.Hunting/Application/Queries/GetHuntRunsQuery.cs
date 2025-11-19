using MediatR;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Shared.Pagination;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Queries;

public class GetHuntRunsQuery : IRequest<Result<PagedResult<HuntRunDto>>>
{
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public Guid? ScheduledHuntId { get; set; }
    public string? Status { get; set; }
    public DateTimeOffset? FromDate { get; set; }
    public DateTimeOffset? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
