using MediatR;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Commands;

public class CreateScimTokenCommand : IRequest<Result<ScimTokenDto>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
}
