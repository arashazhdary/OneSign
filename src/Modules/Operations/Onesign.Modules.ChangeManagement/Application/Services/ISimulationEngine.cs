using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Modules.ChangeManagement.Domain.Entities;

namespace Onesign.Modules.ChangeManagement.Application.Services;

public interface ISimulationEngine
{
    Task<SimulationResultDto> SimulateAsync(ChangeSet changeSet, CancellationToken cancellationToken = default);
}
