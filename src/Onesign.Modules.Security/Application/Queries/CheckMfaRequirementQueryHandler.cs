using MediatR;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Application.Queries;

public class CheckMfaRequirementQueryHandler : IRequestHandler<CheckMfaRequirementQuery, bool>
{
    private readonly ISecurityPolicyService _policyService;

    public CheckMfaRequirementQueryHandler(ISecurityPolicyService policyService)
    {
        _policyService = policyService;
    }

    public async Task<bool> Handle(CheckMfaRequirementQuery request, CancellationToken cancellationToken)
    {
        return await _policyService.IsMfaRequiredAsync(
            request.UserId,
            request.TenantId,
            cancellationToken
        );
    }
}
