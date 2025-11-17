using FluentValidation;
using Onesign.Modules.Applications.Application.DTOs;

namespace Onesign.Modules.Applications.Application.Validators;

public class CreateApplicationClientRequestValidator : AbstractValidator<CreateApplicationClientRequest>
{
    public CreateApplicationClientRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Application name is required")
            .MaximumLength(200).WithMessage("Application name must not exceed 200 characters");

        RuleFor(x => x.RedirectUris)
            .NotEmpty().WithMessage("At least one redirect URI is required");

        RuleForEach(x => x.RedirectUris)
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var result) && 
                         (result!.Scheme == "http" || result.Scheme == "https"))
            .WithMessage("All redirect URIs must be valid HTTP or HTTPS URLs");
    }
}

