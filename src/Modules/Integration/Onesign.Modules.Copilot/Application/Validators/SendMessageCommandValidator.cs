using FluentValidation;
using Onesign.Modules.Copilot.Application.Commands;

namespace Onesign.Modules.Copilot.Application.Validators;

public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    private static readonly string[] SupportedLocales = { "en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh" };

    public SendMessageCommandValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty().WithMessage("Conversation ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Message is required")
            .MaximumLength(10000).WithMessage("Message must not exceed 10000 characters");

        RuleFor(x => x.Locale)
            .NotEmpty().WithMessage("Locale is required")
            .MaximumLength(10).WithMessage("Locale must not exceed 10 characters")
            .Must(locale => SupportedLocales.Contains(locale))
            .WithMessage($"Locale must be one of: {string.Join(", ", SupportedLocales)}");
    }
}
