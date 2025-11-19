using MediatR;
using Onesign.Modules.Developer.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Developer.Application.Commands;

public class CreateServiceAccountCommand : IRequest<Result<ServiceAccountDto>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public Guid CreatedByUserId { get; set; }
}
