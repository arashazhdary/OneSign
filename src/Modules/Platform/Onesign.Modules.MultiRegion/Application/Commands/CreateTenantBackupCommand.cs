using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.MultiRegion.Application.Commands;

public class CreateTenantBackupCommand : IRequest<Result<Guid>>
{
    public Guid TenantId { get; set; }
    public string BackupType { get; set; } = "LogicalExport";
}
