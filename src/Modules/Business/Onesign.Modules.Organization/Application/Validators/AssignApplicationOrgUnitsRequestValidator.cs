using FluentValidation;
using Onesign.Modules.Organization.Application.DTOs;

namespace Onesign.Modules.Organization.Application.Validators;

public class AssignApplicationOrgUnitsRequestValidator : AbstractValidator<AssignApplicationOrgUnitsRequest>
{
    public AssignApplicationOrgUnitsRequestValidator()
    {
        RuleFor(x => x.OrgUnitIds)
            .NotNull().WithMessage("OrgUnitIds cannot be null");

        RuleForEach(x => x.OrgUnitIds)
            .NotEmpty().WithMessage("OrgUnitIds cannot contain empty GUIDs");
    }
}

