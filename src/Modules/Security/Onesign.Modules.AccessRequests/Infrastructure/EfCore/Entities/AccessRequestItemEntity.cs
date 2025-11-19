namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;

public class AccessRequestItemEntity
{
    public Guid Id { get; set; }
    public Guid AccessRequestId { get; set; }
    public int AccessType { get; set; }
    public Guid TargetId { get; set; }
    public string TargetName { get; set; } = string.Empty;
    public int? DurationMinutes { get; set; }
    public int Status { get; set; }

    public AccessRequestEntity? AccessRequest { get; set; }
}
