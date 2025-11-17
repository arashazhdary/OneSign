using MediatR;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Federation.Application.Commands;

public class CreateOidcProviderCommand : IRequest<Result<OidcFederationProviderDto>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public FederationProviderType ProviderType { get; set; }
    public string Authority { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string Scopes { get; set; } = "openid profile email";
}
