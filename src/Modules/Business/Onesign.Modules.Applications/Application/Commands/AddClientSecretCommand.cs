using MediatR;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class AddClientSecretCommand : IRequest<Result<ClientSecretDto>>
{
    public Guid ApplicationId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

