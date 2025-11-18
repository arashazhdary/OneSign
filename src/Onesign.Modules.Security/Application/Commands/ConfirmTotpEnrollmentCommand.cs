using MediatR;
using Onesign.Modules.Security.Application.DTOs;

namespace Onesign.Modules.Security.Application.Commands;

public class ConfirmTotpEnrollmentCommand : IRequest<UserMfaMethodDto>
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public string Secret { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
