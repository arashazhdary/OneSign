using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Application.Services;

public interface IScheduledHuntRunner
{
    Task RunScheduledHuntsAsync(HuntScheduleSpec scheduleSpec, CancellationToken cancellationToken = default);
    Task<HuntRun> RunHuntAsync(ScheduledHunt scheduledHunt, CancellationToken cancellationToken = default);
}
