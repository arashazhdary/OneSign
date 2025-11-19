using MediatR;
using Onesign.Modules.Developer.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Developer.Application.Commands;

public class CreateApiKeyCommand : IRequest<Result<CreateApiKeyResultDto>>
{
    public Guid TenantId { get; set; }
    public Guid? ServiceAccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Scopes { get; set; } = new();
    public DateTime? ExpiresAt { get; set; }
}
