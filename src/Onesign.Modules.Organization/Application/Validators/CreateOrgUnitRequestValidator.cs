using FluentValidation;
using Onesign.Modules.Organization.Application.DTOs;

namespace Onesign.Modules.Organization.Application.Validators;

public class CreateOrgUnitRequestValidator : AbstractValidator<CreateOrgUnitRequest>
{
    public CreateOrgUnitRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(256).WithMessage("Name must not exceed 256 characters");

        RuleFor(x => x.Code)
            .MaximumLength(100).WithMessage("Code must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Code));

        RuleFor(x => x.SortOrder)
            .GreaterThanOrEqualTo(0).WithMessage("SortOrder must be greater than or equal to 0")
            .When(x => x.SortOrder.HasValue);
    }
}

