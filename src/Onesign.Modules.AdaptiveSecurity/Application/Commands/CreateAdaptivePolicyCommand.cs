using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Commands;

public class CreateAdaptivePolicyCommand : IRequest<Result<AdaptivePolicyDto>>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Conditions { get; set; } = "{}";
    public List<AdaptiveActionType> Actions { get; set; } = new();
    public RiskLevel RiskThreshold { get; set; }
    public bool IsEnabled { get; set; }
    public int Priority { get; set; }
}
