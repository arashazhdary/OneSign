using System.Net;

namespace Onesign.Sdk.DotNet.Models;

public class OnesignException : Exception
{
    public HttpStatusCode StatusCode { get; }
    public string? ErrorCode { get; }
    public Dictionary<string, string[]>? ValidationErrors { get; }
    public string? TraceId { get; }

    public OnesignException(string message) : base(message)
    {
        StatusCode = HttpStatusCode.InternalServerError;
    }

    public OnesignException(string message, HttpStatusCode statusCode) : base(message)
    {
        StatusCode = statusCode;
    }

    public OnesignException(string message, HttpStatusCode statusCode, string? errorCode) : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }

    public OnesignException(string message, HttpStatusCode statusCode, string? errorCode, Dictionary<string, string[]>? validationErrors, string? traceId)
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
        ValidationErrors = validationErrors;
        TraceId = traceId;
    }

    public OnesignException(string message, Exception innerException) : base(message, innerException)
    {
        StatusCode = HttpStatusCode.InternalServerError;
    }

    public bool IsValidationError => StatusCode == HttpStatusCode.BadRequest && ValidationErrors?.Any() == true;
    public bool IsUnauthorized => StatusCode == HttpStatusCode.Unauthorized;
    public bool IsForbidden => StatusCode == HttpStatusCode.Forbidden;
    public bool IsNotFound => StatusCode == HttpStatusCode.NotFound;
}

public class OnesignAuthenticationException : OnesignException
{
    public OnesignAuthenticationException(string message)
        : base(message, HttpStatusCode.Unauthorized)
    {
    }
}

public class OnesignValidationException : OnesignException
{
    public OnesignValidationException(string message, Dictionary<string, string[]>? validationErrors = null)
        : base(message, HttpStatusCode.BadRequest, "validation_error", validationErrors, null)
    {
    }
}
