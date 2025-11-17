using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Commands;

public class SyncHRDataCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; set; }
    public List<HRRecordDto> Records { get; set; } = new();
}

public class HRRecordDto
{
    public string ExternalEmployeeId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string OrgUnitCode { get; set; } = string.Empty;
    public string JobRole { get; set; } = string.Empty;
    public string? ManagerEmployeeId { get; set; }
    public string EmploymentStatus { get; set; } = "Active";
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
