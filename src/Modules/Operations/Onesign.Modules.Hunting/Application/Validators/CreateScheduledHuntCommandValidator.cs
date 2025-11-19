using FluentValidation;
using Onesign.Modules.Hunting.Application.Commands;

namespace Onesign.Modules.Hunting.Application.Validators;

public class CreateScheduledHuntCommandValidator : AbstractValidator<CreateScheduledHuntCommand>
{
    public CreateScheduledHuntCommandValidator()
    {
        RuleFor(x => x.ScopeType)
            .NotEmpty().WithMessage("Scope type is required")
            .MaximumLength(50).WithMessage("Scope type must not exceed 50 characters");

        RuleFor(x => x.ScopeId)
            .NotEmpty().WithMessage("Scope ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.SavedQueryId)
            .NotEmpty().WithMessage("Saved query ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(256).WithMessage("Name must not exceed 256 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.ScheduleSpec)
            .NotEmpty().WithMessage("Schedule specification is required")
            .MaximumLength(100).WithMessage("Schedule specification must not exceed 100 characters");

        RuleFor(x => x.MinMatchCountForFinding)
            .GreaterThan(0).WithMessage("Minimum match count must be greater than 0")
            .LessThanOrEqualTo(10000).WithMessage("Minimum match count must not exceed 10000");

        RuleFor(x => x.MaxRowsToScan)
            .GreaterThan(0).WithMessage("Maximum rows to scan must be greater than 0")
            .LessThanOrEqualTo(1000000).WithMessage("Maximum rows to scan must not exceed 1000000");

        RuleFor(x => x.TimeWindowMinutes)
            .GreaterThan(0).WithMessage("Time window must be greater than 0 minutes")
            .LessThanOrEqualTo(43200).WithMessage("Time window must not exceed 43200 minutes (30 days)");
    }
}
