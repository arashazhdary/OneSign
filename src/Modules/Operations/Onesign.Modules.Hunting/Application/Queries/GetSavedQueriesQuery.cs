using MediatR;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Shared.Pagination;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Queries;

public class GetSavedQueriesQuery : IRequest<Result<PagedResult<SavedQueryDto>>>
{
    public string ScopeType { get; set; } = string.Empty;
    public Guid ScopeId { get; set; }
    public string? Dataset { get; set; }
    public bool? IsEnabled { get; set; }
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
