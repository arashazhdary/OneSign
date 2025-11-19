using FluentValidation;
using Onesign.Modules.Incidents.Application.Commands;

namespace Onesign.Modules.Incidents.Application.Validators;

public class AcknowledgeIncidentCommandValidator : AbstractValidator<AcknowledgeIncidentCommand>
{
    public AcknowledgeIncidentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Incident ID is required");

        RuleFor(x => x.AcknowledgedByUserId)
            .NotEmpty().WithMessage("Acknowledged by user ID is required");

        RuleFor(x => x.Note)
            .MaximumLength(1000).WithMessage("Note must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Note));
    }
}
