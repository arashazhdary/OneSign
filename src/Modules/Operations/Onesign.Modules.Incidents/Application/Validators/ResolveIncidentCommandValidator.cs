using FluentValidation;
using Onesign.Modules.Incidents.Application.Commands;

namespace Onesign.Modules.Incidents.Application.Validators;

public class ResolveIncidentCommandValidator : AbstractValidator<ResolveIncidentCommand>
{
    public ResolveIncidentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Incident ID is required");

        RuleFor(x => x.ResolvedByUserId)
            .NotEmpty().WithMessage("Resolved by user ID is required");

        RuleFor(x => x.ResolutionSummary)
            .NotEmpty().WithMessage("Resolution summary is required")
            .MaximumLength(5000).WithMessage("Resolution summary must not exceed 5000 characters");
    }
}
