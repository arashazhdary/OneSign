using FluentValidation;
using Onesign.Modules.Insights.Application.Commands;

namespace Onesign.Modules.Insights.Application.Validators;

public class CreateReportSubscriptionCommandValidator : AbstractValidator<CreateReportSubscriptionCommand>
{
    public CreateReportSubscriptionCommandValidator()
    {
        RuleFor(x => x.ScopeType)
            .IsInEnum().WithMessage("Invalid scope type");

        RuleFor(x => x.ScopeId)
            .NotEmpty().WithMessage("Scope ID is required")
            .When(x => x.ScopeType != Domain.Enums.ScopeType.Global);

        RuleFor(x => x.ReportType)
            .IsInEnum().WithMessage("Invalid report type");

        RuleFor(x => x.CronOrFrequency)
            .NotEmpty().WithMessage("Schedule frequency is required")
            .MaximumLength(100).WithMessage("Schedule frequency must not exceed 100 characters");

        RuleFor(x => x.EmailRecipients)
            .NotEmpty().WithMessage("At least one email recipient is required")
            .Must(recipients => recipients.Count <= 50).WithMessage("Cannot exceed 50 email recipients");

        RuleForEach(x => x.EmailRecipients)
            .NotEmpty().WithMessage("Email address cannot be empty")
            .EmailAddress().WithMessage("Invalid email address format")
            .MaximumLength(256).WithMessage("Email address must not exceed 256 characters");

        RuleFor(x => x.CreatedByUserId)
            .NotEmpty().WithMessage("Created by user ID is required");
    }
}
