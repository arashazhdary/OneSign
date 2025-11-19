using FluentValidation;
using Onesign.Modules.ChangeManagement.Application.Commands;

namespace Onesign.Modules.ChangeManagement.Application.Validators;

public class CreateApprovalRuleCommandValidator : AbstractValidator<CreateApprovalRuleCommand>
{
    public CreateApprovalRuleCommandValidator()
    {
        RuleFor(x => x.ScopeType)
            .NotEmpty().WithMessage("Scope type is required")
            .MaximumLength(50).WithMessage("Scope type must not exceed 50 characters");

        RuleFor(x => x.ScopeId)
            .NotEmpty().WithMessage("Scope ID is required");

        RuleFor(x => x.CreatedByUserId)
            .NotEmpty().WithMessage("Created by user ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(256).WithMessage("Name must not exceed 256 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Invalid change category");

        RuleFor(x => x.MinApprovals)
            .GreaterThan(0).WithMessage("Minimum approvals must be greater than 0")
            .LessThanOrEqualTo(10).WithMessage("Minimum approvals must not exceed 10");

        RuleFor(x => x)
            .Must(x => x.ApproverUserIds.Any() || x.ApproverGroupIds.Any())
            .WithMessage("At least one approver user or group must be specified");

        RuleFor(x => x.ApproverUserIds)
            .Must(ids => ids.Count <= 50).WithMessage("Cannot exceed 50 approver users");

        RuleFor(x => x.ApproverGroupIds)
            .Must(ids => ids.Count <= 20).WithMessage("Cannot exceed 20 approver groups");
    }
}
