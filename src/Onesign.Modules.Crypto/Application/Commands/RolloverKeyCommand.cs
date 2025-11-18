using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Crypto.Application.Commands;

public class RolloverKeyCommand : IRequest<Result<RolloverKeyResponse>>
{
    public Guid KeySetId { get; set; }
}

public class RolloverKeyResponse
{
    public Guid NewKeyVersionId { get; set; }
    public string Kid { get; set; } = string.Empty;
    public DateTime ActivatedAt { get; set; }
}
