using FluentValidation;
using Onesign.Modules.ChangeManagement.Application.Commands;

namespace Onesign.Modules.ChangeManagement.Application.Validators;

public class AddChangeItemCommandValidator : AbstractValidator<AddChangeItemCommand>
{
    public AddChangeItemCommandValidator()
    {
        RuleFor(x => x.ChangeSetId)
            .NotEmpty().WithMessage("Change set ID is required");

        RuleFor(x => x.ScopeType)
            .NotEmpty().WithMessage("Scope type is required")
            .MaximumLength(50).WithMessage("Scope type must not exceed 50 characters");

        RuleFor(x => x.ScopeId)
            .NotEmpty().WithMessage("Scope ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.TargetType)
            .NotEmpty().WithMessage("Target type is required")
            .MaximumLength(100).WithMessage("Target type must not exceed 100 characters");

        RuleFor(x => x.TargetId)
            .NotEmpty().WithMessage("Target ID is required");

        RuleFor(x => x.Operation)
            .NotEmpty().WithMessage("Operation is required")
            .MaximumLength(50).WithMessage("Operation must not exceed 50 characters");

        RuleFor(x => x.CurrentValueJson)
            .MaximumLength(50000).WithMessage("Current value JSON must not exceed 50000 characters")
            .When(x => !string.IsNullOrEmpty(x.CurrentValueJson));

        RuleFor(x => x.ProposedValueJson)
            .MaximumLength(50000).WithMessage("Proposed value JSON must not exceed 50000 characters")
            .When(x => !string.IsNullOrEmpty(x.ProposedValueJson));

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0).WithMessage("Order must be greater than or equal to 0");
    }
}
