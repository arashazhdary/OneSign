using System.Text.Json;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Infrastructure.Services;

public class BasicRiskEvaluationService : IRiskEvaluationService
{
    private readonly ITrustedDeviceRepository _trustedDeviceRepository;
    private readonly IRiskEventRepository _riskEventRepository;

    public BasicRiskEvaluationService(
        ITrustedDeviceRepository trustedDeviceRepository,
        IRiskEventRepository riskEventRepository)
    {
        _trustedDeviceRepository = trustedDeviceRepository ?? throw new ArgumentNullException(nameof(trustedDeviceRepository));
        _riskEventRepository = riskEventRepository ?? throw new ArgumentNullException(nameof(riskEventRepository));
    }

    public async Task<RiskLevel> EvaluateLoginRiskAsync(
        Guid tenantUserId,
        string deviceId,
        string ipAddress,
        string country,
        CancellationToken cancellationToken = default)
    {
        if (tenantUserId == Guid.Empty)
            throw new ArgumentException("TenantUserId cannot be empty", nameof(tenantUserId));

        if (string.IsNullOrWhiteSpace(deviceId))
            throw new ArgumentException("DeviceId cannot be null or empty", nameof(deviceId));

        if (string.IsNullOrWhiteSpace(ipAddress))
            throw new ArgumentException("IpAddress cannot be null or empty", nameof(ipAddress));

        if (string.IsNullOrWhiteSpace(country))
            throw new ArgumentException("Country cannot be null or empty", nameof(country));

        var riskLevel = RiskLevel.Low;
        var riskFactors = new List<string>();

        // Check if device is new (not in trusted devices)
        var trustedDevice = await _trustedDeviceRepository.GetByDeviceIdAsync(
            tenantUserId,
            deviceId,
            cancellationToken);

        if (trustedDevice == null || trustedDevice.IsExpired())
        {
            riskLevel = RiskLevel.Medium;
            riskFactors.Add("New or untrusted device");

            // Record new device login event
            await RecordRiskEventAsync(
                tenantId: null, // We don't have tenantId in this context
                tenantUserId: tenantUserId,
                eventType: RiskEventType.NewDeviceLogin,
                riskLevel: RiskLevel.Medium,
                ipAddress: ipAddress,
                country: country,
                deviceId: deviceId,
                detailsJson: JsonSerializer.Serialize(new { reason = "New device login" }),
                cancellationToken: cancellationToken);
        }

        // Check if country is new by looking at past risk events
        // Query recent events (last 90 days) to see if this user has logged in from this country before
        var fromDate = DateTime.UtcNow.AddDays(-90);
        var pastEvents = await _riskEventRepository.GetByTenantIdAsync(
            tenantId: Guid.Empty, // We'll get events for all tenants, filtered by tenantUserId
            fromDate: fromDate,
            toDate: null,
            riskLevel: null,
            eventType: null,
            tenantUserId: tenantUserId,
            cancellationToken: cancellationToken);

        // Check if user has logged in from a different country
        var hasLoggedInFromDifferentCountry = pastEvents.Any(e =>
            !string.IsNullOrEmpty(e.Country) &&
            !e.Country.Equals(country, StringComparison.OrdinalIgnoreCase));

        var hasLoggedInFromSameCountry = pastEvents.Any(e =>
            !string.IsNullOrEmpty(e.Country) &&
            e.Country.Equals(country, StringComparison.OrdinalIgnoreCase));

        if (hasLoggedInFromDifferentCountry && !hasLoggedInFromSameCountry)
        {
            // User has logged in from other countries but not this one
            riskLevel = RiskLevel.Medium;
            riskFactors.Add($"Login from new country: {country}");

            // Record geo anomaly event
            await RecordRiskEventAsync(
                tenantId: null,
                tenantUserId: tenantUserId,
                eventType: RiskEventType.GeoAnomaly,
                riskLevel: RiskLevel.Medium,
                ipAddress: ipAddress,
                country: country,
                deviceId: deviceId,
                detailsJson: JsonSerializer.Serialize(new { reason = $"Login from new country: {country}" }),
                cancellationToken: cancellationToken);
        }

        // Check recent failed login attempts
        var recentFailedLogins = pastEvents.Count(e =>
            e.EventType == RiskEventType.MultipleFailedLogins &&
            e.CreatedAt >= DateTime.UtcNow.AddMinutes(-10));

        if (recentFailedLogins > 3)
        {
            riskLevel = RiskLevel.High;
            riskFactors.Add($"Multiple failed login attempts: {recentFailedLogins}");

            // Record multiple failed logins event
            await RecordRiskEventAsync(
                tenantId: null,
                tenantUserId: tenantUserId,
                eventType: RiskEventType.MultipleFailedLogins,
                riskLevel: RiskLevel.High,
                ipAddress: ipAddress,
                country: country,
                deviceId: deviceId,
                detailsJson: JsonSerializer.Serialize(new
                {
                    reason = $"Multiple failed login attempts: {recentFailedLogins}",
                    failedAttempts = recentFailedLogins
                }),
                cancellationToken: cancellationToken);
        }

        // If we detected any Medium/High risk factors, log them
        if (riskLevel > RiskLevel.Low && riskFactors.Any())
        {
            await RecordRiskEventAsync(
                tenantId: null,
                tenantUserId: tenantUserId,
                eventType: RiskEventType.SuspiciousActivity,
                riskLevel: riskLevel,
                ipAddress: ipAddress,
                country: country,
                deviceId: deviceId,
                detailsJson: JsonSerializer.Serialize(new
                {
                    riskFactors = riskFactors,
                    evaluatedAt = DateTime.UtcNow
                }),
                cancellationToken: cancellationToken);
        }

        return riskLevel;
    }

    public async Task RecordRiskEventAsync(
        Guid? tenantId,
        Guid? tenantUserId,
        RiskEventType eventType,
        RiskLevel riskLevel,
        string ipAddress,
        string country,
        string deviceId,
        string detailsJson,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(ipAddress))
            throw new ArgumentException("IpAddress cannot be null or empty", nameof(ipAddress));

        if (string.IsNullOrWhiteSpace(country))
            throw new ArgumentException("Country cannot be null or empty", nameof(country));

        if (string.IsNullOrWhiteSpace(deviceId))
            throw new ArgumentException("DeviceId cannot be null or empty", nameof(deviceId));

        var riskEvent = new RiskEvent(
            id: Guid.NewGuid(),
            tenantId: tenantId,
            tenantUserId: tenantUserId,
            eventType: eventType,
            riskLevel: riskLevel,
            ipAddress: ipAddress,
            country: country,
            deviceId: deviceId,
            detailsJson: detailsJson ?? "{}"
        );

        await _riskEventRepository.AddAsync(riskEvent, cancellationToken);
    }
}
