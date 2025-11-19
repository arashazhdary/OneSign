namespace Onesign.Modules.Hunting.Infrastructure.EfCore.Entities;

public class HuntSampleRowEntity
{
    public Guid Id { get; set; }
    public Guid HuntRunId { get; set; }
    public int RowIndex { get; set; }
    public int Dataset { get; set; }
    public string DocumentJson { get; set; } = string.Empty;

    public HuntRunEntity? HuntRun { get; set; }
}
