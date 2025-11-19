using FluentValidation;
using Onesign.Modules.ChangeManagement.Application.Commands;

namespace Onesign.Modules.ChangeManagement.Application.Validators;

public class CreateChangeSetCommandValidator : AbstractValidator<CreateChangeSetCommand>
{
    public CreateChangeSetCommandValidator()
    {
        RuleFor(x => x.ScopeType)
            .NotEmpty().WithMessage("Scope type is required")
            .MaximumLength(50).WithMessage("Scope type must not exceed 50 characters");

        RuleFor(x => x.ScopeId)
            .NotEmpty().WithMessage("Scope ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(256).WithMessage("Title must not exceed 256 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required")
            .MaximumLength(50).WithMessage("Category must not exceed 50 characters");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one change item is required")
            .Must(items => items.Count <= 100).WithMessage("Cannot exceed 100 change items");

        RuleForEach(x => x.Items).SetValidator(new CreateChangeItemDtoValidator());
    }
}

public class CreateChangeItemDtoValidator : AbstractValidator<CreateChangeItemDto>
{
    public CreateChangeItemDtoValidator()
    {
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
