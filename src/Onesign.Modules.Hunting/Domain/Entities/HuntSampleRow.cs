using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Domain.Entities;

public class HuntSampleRow
{
    public Guid Id { get; set; }
    public Guid HuntRunId { get; set; }
    public int RowIndex { get; set; }
    public HuntDataset Dataset { get; set; }
    public string DocumentJson { get; set; } = string.Empty;

    public HuntRun? HuntRun { get; set; }
}
