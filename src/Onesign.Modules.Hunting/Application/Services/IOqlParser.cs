using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Services;

public interface IOqlParser
{
    Result<OqlQueryDto> Parse(string queryDslJson);
    Result ValidateQuery(OqlQueryDto query);
    HuntDataset? ParseDataset(string datasetName);
    (DateTimeOffset Start, DateTimeOffset End) ResolveTimeRange(OqlTimeRangeDto? timeRange);
}
