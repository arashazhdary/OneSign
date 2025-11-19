namespace Onesign.Modules.Observability.Application.DTOs;

public class AuditSearchResultDto
{
    public List<AuditEventDto> Events { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
