using FluentValidation;
using Onesign.Modules.Organization.Application.DTOs;

namespace Onesign.Modules.Organization.Application.Validators;

public class AssignUserOrgUnitsRequestValidator : AbstractValidator<AssignUserOrgUnitsRequest>
{
    public AssignUserOrgUnitsRequestValidator()
    {
        RuleFor(x => x.PrimaryOrgUnitId)
            .NotEmpty().WithMessage("PrimaryOrgUnitId is required");

        RuleFor(x => x.SecondaryOrgUnitIds)
            .NotNull().WithMessage("SecondaryOrgUnitIds cannot be null");

        RuleForEach(x => x.SecondaryOrgUnitIds)
            .NotEmpty().WithMessage("SecondaryOrgUnitIds cannot contain empty GUIDs");
    }
}

