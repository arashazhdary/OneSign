using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.Commands;
using Onesign.Modules.PrivilegedAccess.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class RequestJitAccessCommandHandler : IRequestHandler<RequestJitAccessCommand, Result<Guid>>
{
    private readonly IJitGrantService _jitGrantService;

    public RequestJitAccessCommandHandler(IJitGrantService jitGrantService)
    {
        _jitGrantService = jitGrantService;
    }

    public async Task<Result<Guid>> Handle(RequestJitAccessCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // For JIT access, the user is self-approving or auto-approved based on policy
            // In a real scenario, this might go through an approval workflow
            var grant = await _jitGrantService.CreateJitGrantAsync(
                request.TenantId,
                request.UserId,
                request.RoleId,
                request.DurationMinutes,
                request.UserId, // Self-approved for now
                request.Justification,
                cancellationToken);

            return Result.Success(grant.Id);
        }
        catch (Exception ex)
        {
            return Result.Failure<Guid>("JitAccessRequestFailed", ex.Message);
        }
    }
}
