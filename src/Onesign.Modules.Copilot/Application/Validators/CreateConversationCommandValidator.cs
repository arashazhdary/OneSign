using FluentValidation;
using Onesign.Modules.Copilot.Application.Commands;

namespace Onesign.Modules.Copilot.Application.Validators;

public class CreateConversationCommandValidator : AbstractValidator<CreateConversationCommand>
{
    public CreateConversationCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Title)
            .MaximumLength(256).WithMessage("Title must not exceed 256 characters")
            .When(x => !string.IsNullOrEmpty(x.Title));

        RuleFor(x => x.ContextType)
            .IsInEnum().WithMessage("Invalid context type");

        RuleFor(x => x.ContextId)
            .NotEmpty().WithMessage("Context ID is required when context type is specified")
            .When(x => x.ContextType != Domain.Enums.ContextType.General);
    }
}
