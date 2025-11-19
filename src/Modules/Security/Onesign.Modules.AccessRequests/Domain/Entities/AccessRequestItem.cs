using Onesign.Modules.AccessRequests.Domain.Enums;

namespace Onesign.Modules.AccessRequests.Domain.Entities;

public class AccessRequestItem
{
    public Guid Id { get; set; }
    public Guid AccessRequestId { get; set; }
    public AccessType AccessType { get; set; }
    public Guid TargetId { get; set; } // RoleId or ApplicationId
    public string TargetName { get; set; } = string.Empty;
    public int? DurationMinutes { get; set; } // For JIT access
    public RequestStatus Status { get; set; }

    public AccessRequest? AccessRequest { get; set; }
}
