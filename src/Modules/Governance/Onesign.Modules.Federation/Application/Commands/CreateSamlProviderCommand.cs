using MediatR;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Commands;

public class CreateSamlProviderCommand : IRequest<Result<SamlProviderDto>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string IdpSsoUrl { get; set; } = string.Empty;
    public string IdpCertificate { get; set; } = string.Empty;
    public SamlBindingType BindingType { get; set; }
    public bool SignAuthRequest { get; set; }
    public bool WantAssertionsSigned { get; set; }
}
