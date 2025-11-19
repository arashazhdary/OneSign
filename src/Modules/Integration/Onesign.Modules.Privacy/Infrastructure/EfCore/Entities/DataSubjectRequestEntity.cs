namespace Onesign.Modules.Privacy.Infrastructure.EfCore.Entities;

public class DataSubjectRequestEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid SubjectId { get; set; }
    public int Type { get; set; }
    public int Status { get; set; }
    public DateTime RequestedAt { get; set; }
    public Guid RequestedBy { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ResultLocation { get; set; }
    public string? Reason { get; set; }
}
