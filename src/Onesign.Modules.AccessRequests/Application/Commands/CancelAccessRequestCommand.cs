using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Commands;

public class CancelAccessRequestCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public Guid RequestId { get; set; }
    public Guid CancelledBy { get; set; }
    public string? Reason { get; set; }
}
