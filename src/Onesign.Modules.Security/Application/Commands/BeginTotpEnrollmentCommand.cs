using MediatR;
using Onesign.Modules.Security.Application.DTOs;

namespace Onesign.Modules.Security.Application.Commands;

public class BeginTotpEnrollmentCommand : IRequest<BeginTotpEnrollmentResponse>
{
    public Guid UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
}
