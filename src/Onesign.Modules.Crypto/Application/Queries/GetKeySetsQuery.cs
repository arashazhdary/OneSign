using MediatR;
using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Application.Queries;

public class GetKeySetsQuery : IRequest<IReadOnlyList<KeySetDto>>
{
    public KeyScopeType? ScopeType { get; set; }
    public string? ScopeId { get; set; }
    public KeyPurpose? Purpose { get; set; }
}

public class KeySetDto
{
    public Guid Id { get; set; }
    public KeyScopeType ScopeType { get; set; }
    public string ScopeId { get; set; } = string.Empty;
    public KeyPurpose Purpose { get; set; }
    public bool IsDefaultForScope { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ActiveKeyVersionsCount { get; set; }
}
