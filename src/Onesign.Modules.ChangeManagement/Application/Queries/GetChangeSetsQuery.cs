using MediatR;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Shared.Pagination;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Queries;

public class GetChangeSetsQuery : IRequest<Result<PagedResult<ChangeSetDto>>>
{
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public string? Status { get; set; }
    public string? Category { get; set; }
    public Guid? RequestedByUserId { get; set; }
    public DateTimeOffset? FromDate { get; set; }
    public DateTimeOffset? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
