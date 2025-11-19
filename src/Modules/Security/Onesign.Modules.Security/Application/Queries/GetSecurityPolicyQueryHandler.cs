using MediatR;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Modules.Security.Application.Queries;

public class GetSecurityPolicyQueryHandler : IRequestHandler<GetSecurityPolicyQuery, SecurityPolicyDto?>
{
    private readonly ISecurityPolicyRepository _repository;

    public GetSecurityPolicyQueryHandler(ISecurityPolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<SecurityPolicyDto?> Handle(GetSecurityPolicyQuery request, CancellationToken cancellationToken)
    {
        var policy = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (policy == null)
            return null;

        return new SecurityPolicyDto
        {
            Id = policy.Id,
            TenantId = policy.TenantId,
            MfaRequirement = (int)policy.MfaRequirement,
            AllowTrustedDevices = policy.AllowTrustedDevices,
            TrustedDeviceExpireDays = policy.TrustedDeviceExpireDays,
            SessionTimeoutMinutes = policy.SessionTimeoutMinutes,
            MaxFailedLoginAttempts = policy.MaxFailedLoginAttempts
        };
    }
}
