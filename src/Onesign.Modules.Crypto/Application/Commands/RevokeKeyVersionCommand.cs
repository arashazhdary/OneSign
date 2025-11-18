using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Crypto.Application.Commands;

public class RevokeKeyVersionCommand : IRequest<Result<Unit>>
{
    public Guid KeyVersionId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
