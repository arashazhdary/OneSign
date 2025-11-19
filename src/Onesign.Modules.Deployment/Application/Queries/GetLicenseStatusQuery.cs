using MediatR;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Deployment.Application.Queries;

public class GetLicenseStatusQuery : IRequest<Result<LicenseStatusResponse>>
{
}

public class LicenseStatusResponse
{
    public bool HasLicense { get; set; }
    public string? LicenseKey { get; set; }
    public LicenseType? Type { get; set; }
    public string? CustomerName { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsValid { get; set; }
    public int DaysUntilExpiry { get; set; }
    public List<string> EnabledFeatures { get; set; } = new();
    public List<string> EnabledModules { get; set; } = new();
    public LicenseUsageInfo? Usage { get; set; }
}

public class GetLicenseStatusQueryHandler : IRequestHandler<GetLicenseStatusQuery, Result<LicenseStatusResponse>>
{
    private readonly ILicenseValidator _licenseValidator;

    public GetLicenseStatusQueryHandler(ILicenseValidator licenseValidator)
    {
        _licenseValidator = licenseValidator;
    }

    public async Task<Result<LicenseStatusResponse>> Handle(GetLicenseStatusQuery request, CancellationToken cancellationToken)
    {
        var license = await _licenseValidator.GetCurrentLicenseAsync(cancellationToken);

        if (license == null)
        {
            return Result.Success(new LicenseStatusResponse
            {
                HasLicense = false,
                IsValid = false
            });
        }

        var usage = await _licenseValidator.GetLicenseUsageAsync(cancellationToken);

        var response = new LicenseStatusResponse
        {
            HasLicense = true,
            LicenseKey = MaskLicenseKey(license.Key),
            Type = license.Type,
            CustomerName = license.CustomerName,
            ExpiresAt = license.ExpiresAt,
            IsValid = license.IsActive && license.ExpiresAt > DateTime.UtcNow,
            DaysUntilExpiry = (int)(license.ExpiresAt - DateTime.UtcNow).TotalDays,
            EnabledFeatures = license.EnabledFeatures,
            EnabledModules = license.EnabledModules,
            Usage = usage
        };

        return Result.Success(response);
    }

    private static string MaskLicenseKey(string key)
    {
        if (string.IsNullOrEmpty(key) || key.Length < 8)
        {
            return "****";
        }

        return key.Substring(0, 4) + new string('*', key.Length - 8) + key.Substring(key.Length - 4);
    }
}
