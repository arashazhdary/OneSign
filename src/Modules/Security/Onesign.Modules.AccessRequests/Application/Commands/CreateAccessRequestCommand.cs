using MediatR;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AccessRequests.Application.Commands;

public class CreateAccessRequestCommand : IRequest<Result<AccessRequestDto>>
{
    public Guid TenantId { get; set; }
    public Guid RequesterId { get; set; }
    public string RequesterName { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;
    public List<AccessRequestItemDto> Items { get; set; } = new();
}
