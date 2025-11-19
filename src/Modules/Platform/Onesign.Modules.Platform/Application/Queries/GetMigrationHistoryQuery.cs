using MediatR;
using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Platform.Application.Queries;

public class GetMigrationHistoryQuery : IRequest<Result<PaginatedResultDto<MigrationHistoryDto>>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Status { get; set; }
}

public class GetMigrationByIdQuery : IRequest<Result<MigrationHistoryDto>>
{
    public Guid Id { get; set; }
}
