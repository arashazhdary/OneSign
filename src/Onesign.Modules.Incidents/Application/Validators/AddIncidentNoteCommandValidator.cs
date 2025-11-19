using FluentValidation;
using Onesign.Modules.Incidents.Application.Commands;

namespace Onesign.Modules.Incidents.Application.Validators;

public class AddIncidentNoteCommandValidator : AbstractValidator<AddIncidentNoteCommand>
{
    public AddIncidentNoteCommandValidator()
    {
        RuleFor(x => x.IncidentId)
            .NotEmpty().WithMessage("Incident ID is required");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Note content is required")
            .MaximumLength(5000).WithMessage("Note content must not exceed 5000 characters");

        RuleFor(x => x.CreatedByUserId)
            .NotEmpty().WithMessage("Created by user ID is required");
    }
}
