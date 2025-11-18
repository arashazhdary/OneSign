using System.Text.Json.Serialization;

namespace Onesign.Sdk.DotNet.Models;

public class PaginatedResult<T>
{
    [JsonPropertyName("items")]
    public List<T> Items { get; set; } = new();

    [JsonPropertyName("totalCount")]
    public int TotalCount { get; set; }

    [JsonPropertyName("pageNumber")]
    public int PageNumber { get; set; }

    [JsonPropertyName("pageSize")]
    public int PageSize { get; set; }

    [JsonPropertyName("totalPages")]
    public int TotalPages { get; set; }

    [JsonPropertyName("hasPreviousPage")]
    public bool HasPreviousPage => PageNumber > 1;

    [JsonPropertyName("hasNextPage")]
    public bool HasNextPage => PageNumber < TotalPages;
}

public class PaginationRequest
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = false;

    public Dictionary<string, string> ToQueryParameters()
    {
        var parameters = new Dictionary<string, string>
        {
            ["pageNumber"] = PageNumber.ToString(),
            ["pageSize"] = PageSize.ToString()
        };

        if (!string.IsNullOrEmpty(SearchTerm))
        {
            parameters["search"] = SearchTerm;
        }

        if (!string.IsNullOrEmpty(SortBy))
        {
            parameters["sortBy"] = SortBy;
            parameters["sortDesc"] = SortDescending.ToString().ToLower();
        }

        return parameters;
    }
}
