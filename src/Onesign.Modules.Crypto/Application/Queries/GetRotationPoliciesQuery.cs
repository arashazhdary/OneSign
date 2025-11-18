using MediatR;
using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Application.Queries;

public class GetRotationPoliciesQuery : IRequest<IReadOnlyList<RotationPolicyDto>>
{
    public KeyScopeType? ScopeType { get; set; }
    public string? ScopeId { get; set; }
    public bool? Enabled { get; set; }
}

public class RotationPolicyDto
{
    public Guid Id { get; set; }
    public KeyScopeType ScopeType { get; set; }
    public string ScopeId { get; set; } = string.Empty;
    public KeyPurpose Purpose { get; set; }
    public int RotationPeriodDays { get; set; }
    public int OverlapPeriodDays { get; set; }
    public bool Enabled { get; set; }
}
