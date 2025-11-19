using MediatR;

namespace Onesign.Modules.Insights.Application.Commands;

public class GenerateSnapshotCommand : IRequest<GenerateSnapshotResult>
{
    public DateOnly Date { get; set; }
    public Guid? TenantId { get; set; }
}

public class GenerateSnapshotResult
{
    public bool Success { get; set; }
    public int TenantSnapshotsGenerated { get; set; }
    public int ApplicationSnapshotsGenerated { get; set; }
    public int UserPosturesUpdated { get; set; }
    public string? ErrorMessage { get; set; }
}
