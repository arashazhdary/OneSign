namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

public class IncidentLinkedEntity
{
    public Guid Id { get; set; }
    public Guid IncidentId { get; set; }
    public int EntityType { get; set; }
    public string EntityId { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public int Role { get; set; }
}
