using System.Text.Json.Serialization;

namespace Onesign.Sdk.DotNet.Models;

public class ApiResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("errors")]
    public List<string>? Errors { get; set; }
}

public class ApiResponse<T> : ApiResponse
{
    [JsonPropertyName("data")]
    public T? Data { get; set; }
}

public class ErrorResponse
{
    [JsonPropertyName("error")]
    public string Error { get; set; } = string.Empty;

    [JsonPropertyName("error_description")]
    public string? ErrorDescription { get; set; }

    [JsonPropertyName("errors")]
    public Dictionary<string, string[]>? ValidationErrors { get; set; }

    [JsonPropertyName("traceId")]
    public string? TraceId { get; set; }
}
