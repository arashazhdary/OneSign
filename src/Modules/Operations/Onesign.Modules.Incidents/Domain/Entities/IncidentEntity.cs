using Onesign.Modules.Incidents.Domain.Enums;

namespace Onesign.Modules.Incidents.Domain.Entities;

/// <summary>
/// Represents a linked entity associated with an incident (e.g., affected user, application, etc.)
/// </summary>
public class IncidentLinkedItem
{
    public Guid Id { get; set; }
    public Guid IncidentId { get; set; }
    public IncidentEntityType EntityType { get; set; }
    public string EntityId { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public IncidentEntityRole Role { get; set; }
}

// Alias for backward compatibility
[Obsolete("Use IncidentLinkedItem instead. This alias will be removed in a future version.")]
public class IncidentEntity : IncidentLinkedItem { }
