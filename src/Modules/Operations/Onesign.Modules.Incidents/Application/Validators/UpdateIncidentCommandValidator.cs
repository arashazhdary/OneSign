using FluentValidation;
using Onesign.Modules.Incidents.Application.Commands;

namespace Onesign.Modules.Incidents.Application.Validators;

public class UpdateIncidentCommandValidator : AbstractValidator<UpdateIncidentCommand>
{
    public UpdateIncidentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Incident ID is required");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(256).WithMessage("Title must not exceed 256 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(5000).WithMessage("Description must not exceed 5000 characters");

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Invalid incident category");

        RuleFor(x => x.Severity)
            .IsInEnum().WithMessage("Invalid incident severity");

        RuleFor(x => x.AffectedUsersCount)
            .GreaterThanOrEqualTo(0).WithMessage("Affected users count must be greater than or equal to 0");

        RuleFor(x => x.AffectedAppsCount)
            .GreaterThanOrEqualTo(0).WithMessage("Affected apps count must be greater than or equal to 0");

        RuleFor(x => x.UpdatedByUserId)
            .NotEmpty().WithMessage("Updated by user ID is required");
    }
}
