using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Commands;

public class SubmitAccessRequestCommand : IRequest<Result<AccessRequestDto>>
{
    public Guid TenantId { get; set; }
    public Guid RequesterId { get; set; }
    public string RequesterName { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;
    public List<AccessRequestItemInput> Items { get; set; } = new();
}

public class AccessRequestItemInput
{
    public string AccessType { get; set; } = string.Empty;
    public Guid TargetId { get; set; }
    public string TargetName { get; set; } = string.Empty;
    public int? DurationMinutes { get; set; }
}
