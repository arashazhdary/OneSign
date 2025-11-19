using FluentValidation;
using Onesign.Modules.Incidents.Application.Commands;

namespace Onesign.Modules.Incidents.Application.Validators;

public class CreateIncidentCommandValidator : AbstractValidator<CreateIncidentCommand>
{
    public CreateIncidentCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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

        RuleFor(x => x.DetectionSource)
            .IsInEnum().WithMessage("Invalid detection source");

        RuleFor(x => x.AffectedUsersCount)
            .GreaterThanOrEqualTo(0).WithMessage("Affected users count must be greater than or equal to 0");

        RuleFor(x => x.AffectedAppsCount)
            .GreaterThanOrEqualTo(0).WithMessage("Affected apps count must be greater than or equal to 0");

        RuleFor(x => x.InitialEvents)
            .Must(events => events.Count <= 100).WithMessage("Cannot exceed 100 initial events")
            .When(x => x.InitialEvents != null && x.InitialEvents.Any());

        RuleFor(x => x.RelatedEntities)
            .Must(entities => entities.Count <= 100).WithMessage("Cannot exceed 100 related entities")
            .When(x => x.RelatedEntities != null && x.RelatedEntities.Any());
    }
}
