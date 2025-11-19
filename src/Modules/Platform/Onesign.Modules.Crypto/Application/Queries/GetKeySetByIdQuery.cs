using MediatR;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Crypto.Application.Queries;

public class GetKeySetByIdQuery : IRequest<Result<KeySetDetailDto>>
{
    public Guid KeySetId { get; set; }
}

public class KeySetDetailDto
{
    public Guid Id { get; set; }
    public KeyScopeType ScopeType { get; set; }
    public string ScopeId { get; set; } = string.Empty;
    public KeyPurpose Purpose { get; set; }
    public bool IsDefaultForScope { get; set; }
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<KeyVersionDto> KeyVersions { get; set; } = Array.Empty<KeyVersionDto>();
}

public class KeyVersionDto
{
    public Guid Id { get; set; }
    public string Kid { get; set; } = string.Empty;
    public string Algorithm { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ActivatedAt { get; set; }
    public DateTime? ExpiredAt { get; set; }
    public KeyVersionState State { get; set; }
}
