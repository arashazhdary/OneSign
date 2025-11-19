using FluentValidation;
using Onesign.Modules.ChangeManagement.Application.Commands;

namespace Onesign.Modules.ChangeManagement.Application.Validators;

public class RejectChangeSetCommandValidator : AbstractValidator<RejectChangeSetCommand>
{
    public RejectChangeSetCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Change set ID is required");

        RuleFor(x => x.ScopeType)
            .NotEmpty().WithMessage("Scope type is required")
            .MaximumLength(50).WithMessage("Scope type must not exceed 50 characters");

        RuleFor(x => x.ScopeId)
            .NotEmpty().WithMessage("Scope ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Rejection reason is required")
            .MaximumLength(1000).WithMessage("Reason must not exceed 1000 characters");
    }
}
