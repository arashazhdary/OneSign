using FluentValidation;
using Onesign.Modules.Hunting.Application.Commands;

namespace Onesign.Modules.Hunting.Application.Validators;

public class UpdateSavedQueryCommandValidator : AbstractValidator<UpdateSavedQueryCommand>
{
    public UpdateSavedQueryCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Query ID is required");

        RuleFor(x => x.ScopeType)
            .NotEmpty().WithMessage("Scope type is required")
            .MaximumLength(50).WithMessage("Scope type must not exceed 50 characters");

        RuleFor(x => x.ScopeId)
            .NotEmpty().WithMessage("Scope ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(256).WithMessage("Name must not exceed 256 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Dataset)
            .NotEmpty().WithMessage("Dataset is required")
            .MaximumLength(100).WithMessage("Dataset must not exceed 100 characters");

        RuleFor(x => x.QueryDslJson)
            .NotEmpty().WithMessage("Query DSL JSON is required")
            .MaximumLength(50000).WithMessage("Query DSL JSON must not exceed 50000 characters")
            .Must(BeValidJson).WithMessage("Query DSL must be valid JSON");
    }

    private bool BeValidJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return false;

        try
        {
            System.Text.Json.JsonDocument.Parse(json);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
