using MediatR;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Commands;

public class DeletePolicyCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}
