namespace Onesign.Shared.Localization;

public interface ILocalizationService
{
    string GetString(string key, string? culture = null);
    string GetString(string key, params object[] args);
    string GetString(string key, string? culture, params object[] args);
    string GetCultureFromHeader(string? acceptLanguage);
}

