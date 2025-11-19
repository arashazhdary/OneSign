using MediatR;
using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Platform.Application.Commands;

public class ApplyMigrationCommand : IRequest<Result<MigrationHistoryDto>>
{
    public string MigrationName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}
