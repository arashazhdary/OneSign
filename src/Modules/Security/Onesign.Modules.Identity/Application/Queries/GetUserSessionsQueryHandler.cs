using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Repositories;
using UAParser;

namespace Onesign.Modules.Identity.Application.Queries;

public class GetUserSessionsQueryHandler : IRequestHandler<GetUserSessionsQuery, List<UserSessionDto>>
{
    private readonly IUserLoginSessionRepository _sessionRepository;

    public GetUserSessionsQueryHandler(IUserLoginSessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<List<UserSessionDto>> Handle(GetUserSessionsQuery request, CancellationToken cancellationToken)
    {
        var sessions = await _sessionRepository.GetByTenantUserIdAsync(request.TenantUserId, cancellationToken);

        return sessions.Select(session => new UserSessionDto
        {
            Id = session.Id,
            DeviceType = session.DeviceType ?? GetDeviceTypeFromUserAgent(session.UserAgent),
            DeviceName = session.DeviceName ?? GetDeviceNameFromUserAgent(session.UserAgent),
            Browser = session.Browser ?? GetBrowserFromUserAgent(session.UserAgent),
            BrowserVersion = session.BrowserVersion ?? string.Empty,
            OperatingSystem = session.OperatingSystem ?? GetOSFromUserAgent(session.UserAgent),
            IpAddress = session.IpAddress ?? "Unknown",
            City = session.City,
            Country = session.Country,
            LastActiveAt = session.LastActiveAt,
            CreatedAt = session.CreatedAt,
            IsCurrentSession = session.SessionToken == request.CurrentSessionToken
        }).ToList();
    }

    private static string GetDeviceTypeFromUserAgent(string? userAgent)
    {
        if (string.IsNullOrEmpty(userAgent)) return "Desktop";

        var uaParser = Parser.GetDefault();
        var clientInfo = uaParser.Parse(userAgent);

        if (clientInfo.Device.IsSpider) return "Bot";
        if (clientInfo.Device.Family.Contains("iPhone") || clientInfo.Device.Family.Contains("Android")) return "Mobile";
        if (clientInfo.Device.Family.Contains("iPad") || clientInfo.Device.Family.Contains("Tablet")) return "Tablet";

        return "Desktop";
    }

    private static string GetDeviceNameFromUserAgent(string? userAgent)
    {
        if (string.IsNullOrEmpty(userAgent)) return "Unknown Device";

        var uaParser = Parser.GetDefault();
        var clientInfo = uaParser.Parse(userAgent);

        var os = clientInfo.OS.Family;
        var device = clientInfo.Device.Family;

        if (device == "Other" || string.IsNullOrEmpty(device))
            return $"{os}";

        return $"{device} ({os})";
    }

    private static string GetBrowserFromUserAgent(string? userAgent)
    {
        if (string.IsNullOrEmpty(userAgent)) return "Unknown";

        var uaParser = Parser.GetDefault();
        var clientInfo = uaParser.Parse(userAgent);

        return $"{clientInfo.UA.Family} {clientInfo.UA.Major}.{clientInfo.UA.Minor}";
    }

    private static string GetOSFromUserAgent(string? userAgent)
    {
        if (string.IsNullOrEmpty(userAgent)) return "Unknown";

        var uaParser = Parser.GetDefault();
        var clientInfo = uaParser.Parse(userAgent);

        var version = !string.IsNullOrEmpty(clientInfo.OS.Major)
            ? $" {clientInfo.OS.Major}.{clientInfo.OS.Minor}"
            : string.Empty;

        return $"{clientInfo.OS.Family}{version}";
    }
}
