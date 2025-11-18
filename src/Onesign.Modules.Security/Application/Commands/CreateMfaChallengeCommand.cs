using MediatR;
using Onesign.Modules.Security.Application.DTOs;

namespace Onesign.Modules.Security.Application.Commands;

public class CreateMfaChallengeCommand : IRequest<MfaChallengeResponse>
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public int? PreferredMethodType { get; set; }
    public string UserEmail { get; set; } = string.Empty;
}
