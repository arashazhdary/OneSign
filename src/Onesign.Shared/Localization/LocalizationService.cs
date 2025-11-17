using System.Globalization;
using System.Resources;

namespace Onesign.Shared.Localization;

public class LocalizationService : ILocalizationService
{
    private readonly ResourceManager _resourceManager;
    private readonly string _defaultCulture = "en";

    public LocalizationService()
    {
        _resourceManager = new ResourceManager("Onesign.Shared.Resources.Messages", typeof(LocalizationService).Assembly);
    }

    public string GetCultureFromHeader(string? acceptLanguage)
    {
        if (string.IsNullOrEmpty(acceptLanguage))
            return _defaultCulture;

        // Parse Accept-Language header (e.g., "en-US,en;q=0.9,fa;q=0.8")
        var languages = acceptLanguage.Split(',')
            .Select(lang => lang.Split(';')[0].Trim().ToLower())
            .ToList();

        // Check for Persian/Farsi
        if (languages.Any(l => l.StartsWith("fa") || l == "persian"))
            return "fa";

        // Default to English
        return "en";
    }

    public string GetString(string key, string? culture = null)
    {
        culture ??= _defaultCulture;
        var cultureInfo = new CultureInfo(culture);
        var value = _resourceManager.GetString(key, cultureInfo);
        return value ?? key;
    }

    public string GetString(string key, params object[] args)
    {
        return GetString(key, null, args);
    }

    public string GetString(string key, string? culture, params object[] args)
    {
        var format = GetString(key, culture);
        return string.Format(format, args);
    }
}

