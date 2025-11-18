namespace Onesign.Api.Middleware;

/// <summary>
/// Middleware that adds security headers to all responses
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SecurityHeadersMiddleware> _logger;
    private readonly SecurityHeadersOptions _options;

    public SecurityHeadersMiddleware(RequestDelegate next, ILogger<SecurityHeadersMiddleware> logger)
        : this(next, logger, new SecurityHeadersOptions())
    {
    }

    public SecurityHeadersMiddleware(RequestDelegate next, ILogger<SecurityHeadersMiddleware> logger, SecurityHeadersOptions options)
    {
        _next = next;
        _logger = logger;
        _options = options ?? new SecurityHeadersOptions();
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Add security headers before processing the request
        AddSecurityHeaders(context.Response.Headers);

        await _next(context);
    }

    private void AddSecurityHeaders(IHeaderDictionary headers)
    {
        // Content Security Policy
        if (_options.EnableCsp && !string.IsNullOrEmpty(_options.ContentSecurityPolicy))
        {
            headers["Content-Security-Policy"] = _options.ContentSecurityPolicy;
        }

        // X-Content-Type-Options - Prevent MIME type sniffing
        headers["X-Content-Type-Options"] = "nosniff";

        // X-Frame-Options - Prevent clickjacking
        if (!string.IsNullOrEmpty(_options.XFrameOptions))
        {
            headers["X-Frame-Options"] = _options.XFrameOptions;
        }

        // X-XSS-Protection - Enable XSS filtering (legacy browsers)
        headers["X-XSS-Protection"] = "1; mode=block";

        // Referrer-Policy - Control referrer information
        if (!string.IsNullOrEmpty(_options.ReferrerPolicy))
        {
            headers["Referrer-Policy"] = _options.ReferrerPolicy;
        }

        // Strict-Transport-Security (HSTS)
        if (_options.EnableHsts)
        {
            var hstsValue = $"max-age={_options.HstsMaxAge}";
            if (_options.HstsIncludeSubDomains)
            {
                hstsValue += "; includeSubDomains";
            }
            if (_options.HstsPreload)
            {
                hstsValue += "; preload";
            }
            headers["Strict-Transport-Security"] = hstsValue;
        }

        // Permissions-Policy (formerly Feature-Policy)
        if (!string.IsNullOrEmpty(_options.PermissionsPolicy))
        {
            headers["Permissions-Policy"] = _options.PermissionsPolicy;
        }

        // Cross-Origin-Embedder-Policy
        if (!string.IsNullOrEmpty(_options.CrossOriginEmbedderPolicy))
        {
            headers["Cross-Origin-Embedder-Policy"] = _options.CrossOriginEmbedderPolicy;
        }

        // Cross-Origin-Opener-Policy
        if (!string.IsNullOrEmpty(_options.CrossOriginOpenerPolicy))
        {
            headers["Cross-Origin-Opener-Policy"] = _options.CrossOriginOpenerPolicy;
        }

        // Cross-Origin-Resource-Policy
        if (!string.IsNullOrEmpty(_options.CrossOriginResourcePolicy))
        {
            headers["Cross-Origin-Resource-Policy"] = _options.CrossOriginResourcePolicy;
        }

        // Remove potentially dangerous headers
        headers.Remove("X-Powered-By");
        headers.Remove("Server");
    }
}

/// <summary>
/// Configuration options for security headers
/// </summary>
public class SecurityHeadersOptions
{
    /// <summary>
    /// Enable Content Security Policy header
    /// </summary>
    public bool EnableCsp { get; set; } = true;

    /// <summary>
    /// Content Security Policy value
    /// </summary>
    public string ContentSecurityPolicy { get; set; } =
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'";

    /// <summary>
    /// X-Frame-Options value (DENY, SAMEORIGIN, or ALLOW-FROM uri)
    /// </summary>
    public string XFrameOptions { get; set; } = "DENY";

    /// <summary>
    /// Referrer-Policy value
    /// </summary>
    public string ReferrerPolicy { get; set; } = "strict-origin-when-cross-origin";

    /// <summary>
    /// Enable HTTP Strict Transport Security
    /// </summary>
    public bool EnableHsts { get; set; } = true;

    /// <summary>
    /// HSTS max-age in seconds (default: 1 year)
    /// </summary>
    public int HstsMaxAge { get; set; } = 31536000;

    /// <summary>
    /// Include subdomains in HSTS
    /// </summary>
    public bool HstsIncludeSubDomains { get; set; } = true;

    /// <summary>
    /// Enable HSTS preload
    /// </summary>
    public bool HstsPreload { get; set; } = false;

    /// <summary>
    /// Permissions-Policy header value
    /// </summary>
    public string PermissionsPolicy { get; set; } =
        "accelerometer=(), " +
        "camera=(), " +
        "geolocation=(), " +
        "gyroscope=(), " +
        "magnetometer=(), " +
        "microphone=(), " +
        "payment=(), " +
        "usb=()";

    /// <summary>
    /// Cross-Origin-Embedder-Policy header value
    /// </summary>
    public string CrossOriginEmbedderPolicy { get; set; } = "require-corp";

    /// <summary>
    /// Cross-Origin-Opener-Policy header value
    /// </summary>
    public string CrossOriginOpenerPolicy { get; set; } = "same-origin";

    /// <summary>
    /// Cross-Origin-Resource-Policy header value
    /// </summary>
    public string CrossOriginResourcePolicy { get; set; } = "same-origin";
}
