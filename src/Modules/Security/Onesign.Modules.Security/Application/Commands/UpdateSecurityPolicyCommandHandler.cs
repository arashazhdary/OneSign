using MediatR;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Modules.Security.Application.Commands;

public class UpdateSecurityPolicyCommandHandler : IRequestHandler<UpdateSecurityPolicyCommand, SecurityPolicyDto>
{
    private readonly ISecurityPolicyRepository _repository;

    public UpdateSecurityPolicyCommandHandler(ISecurityPolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<SecurityPolicyDto> Handle(UpdateSecurityPolicyCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        SecurityPolicy policy;
        if (existing == null)
        {
            policy = SecurityPolicy.Create(
                request.TenantId,
                (MfaRequirementLevel)request.MfaRequirement,
                request.AllowTrustedDevices,
                request.TrustedDeviceExpireDays,
                request.SessionTimeoutMinutes,
                request.MaxFailedLoginAttempts
            );
            await _repository.AddAsync(policy, cancellationToken);
        }
        else
        {
            existing.UpdateSettings(
                (MfaRequirementLevel)request.MfaRequirement,
                request.AllowTrustedDevices,
                request.TrustedDeviceExpireDays,
                request.SessionTimeoutMinutes,
                request.MaxFailedLoginAttempts
            );
            await _repository.UpdateAsync(existing, cancellationToken);
            policy = existing;
        }

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
