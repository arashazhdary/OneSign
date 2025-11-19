using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class RemoveClientSecretCommand : IRequest<Result>
{
    public Guid SecretId { get; set; }
    public Guid TenantId { get; set; }
}

