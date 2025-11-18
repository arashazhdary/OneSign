using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Developer.Application.Commands;

public class RevokeApiKeyCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public string? Reason { get; set; }
}
