using FluentValidation;
using Onesign.Modules.Platform.Application.Commands;

namespace Onesign.Modules.Platform.Application.Validators;

public class ApplyMigrationCommandValidator : AbstractValidator<ApplyMigrationCommand>
{
    public ApplyMigrationCommandValidator()
    {
        RuleFor(x => x.MigrationName)
            .NotEmpty().WithMessage("Migration name is required")
            .MaximumLength(256).WithMessage("Migration name must not exceed 256 characters")
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Migration name must contain only alphanumeric characters and underscores");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");
    }
}
