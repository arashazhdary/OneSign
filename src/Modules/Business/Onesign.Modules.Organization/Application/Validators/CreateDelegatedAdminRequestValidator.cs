using FluentValidation;
using Onesign.Modules.Organization.Application.DTOs;

namespace Onesign.Modules.Organization.Application.Validators;

public class CreateDelegatedAdminRequestValidator : AbstractValidator<CreateDelegatedAdminRequest>
{
    public CreateDelegatedAdminRequestValidator()
    {
        RuleFor(x => x.TenantUserId)
            .NotEmpty().WithMessage("TenantUserId is required");

        RuleFor(x => x.OrgUnitId)
            .NotEmpty().WithMessage("OrgUnitId is required");

        RuleFor(x => x.ScopeType)
            .IsInEnum().WithMessage("ScopeType must be a valid AdminScopeType value");
    }
}

