using FluentValidation;
using Onesign.Modules.Platform.Application.Commands;

namespace Onesign.Modules.Platform.Application.Validators;

public class CreatePlatformVersionCommandValidator : AbstractValidator<CreatePlatformVersionCommand>
{
    public CreatePlatformVersionCommandValidator()
    {
        RuleFor(x => x.Version)
            .NotEmpty().WithMessage("Version is required")
            .MaximumLength(50).WithMessage("Version must not exceed 50 characters")
            .Matches(@"^\d+\.\d+\.\d+(-[\w.]+)?$").WithMessage("Version must be in semantic version format (e.g., 1.0.0 or 1.0.0-beta.1)");

        RuleFor(x => x.ReleaseNotes)
            .MaximumLength(10000).WithMessage("Release notes must not exceed 10000 characters")
            .When(x => !string.IsNullOrEmpty(x.ReleaseNotes));

        RuleFor(x => x.ReleaseDate)
            .NotEmpty().WithMessage("Release date is required")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("Release date cannot be in the future");

        RuleFor(x => x.CreatedByUserId)
            .NotEmpty().WithMessage("Created by user ID is required");
    }
}
