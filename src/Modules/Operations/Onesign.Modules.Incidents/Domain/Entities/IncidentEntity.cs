using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Modules.Incidents.Domain.Entities;

public class IncidentEntity
{
    public Guid Id { get; set; }
    public Guid IncidentId { get; set; }
    public IncidentEntityType EntityType { get; set; }
    public string EntityId { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public IncidentEntityRole Role { get; set; }
}
