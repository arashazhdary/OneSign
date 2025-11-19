using MediatR;
using Onesign.Modules.Deployment.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Commands;

public class ValidateLicenseCommand : IRequest<Result<LicenseValidationResult>>
{
    public string LicenseKey { get; set; } = string.Empty;
    public bool Activate { get; set; } = false;
}

public class ValidateLicenseCommandHandler : IRequestHandler<ValidateLicenseCommand, Result<LicenseValidationResult>>
{
    private readonly ILicenseValidator _licenseValidator;

    public ValidateLicenseCommandHandler(ILicenseValidator licenseValidator)
    {
        _licenseValidator = licenseValidator;
    }

    public async Task<Result<LicenseValidationResult>> Handle(ValidateLicenseCommand request, CancellationToken cancellationToken)
    {
        var result = await _licenseValidator.ValidateLicenseAsync(request.LicenseKey, cancellationToken);

        if (request.Activate && result.IsValid)
        {
            await _licenseValidator.ActivateLicenseAsync(request.LicenseKey, cancellationToken);
        }

        return Result.Success(result);
    }
}
