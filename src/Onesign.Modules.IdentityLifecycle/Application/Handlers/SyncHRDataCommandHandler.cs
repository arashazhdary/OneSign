using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.Commands;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class SyncHRDataCommandHandler : IRequestHandler<SyncHRDataCommand, Result<int>>
{
    private readonly IHRIdentityRecordRepository _hrRecordRepository;
    private readonly ILifecycleEventRepository _lifecycleEventRepository;

    public SyncHRDataCommandHandler(
        IHRIdentityRecordRepository hrRecordRepository,
        ILifecycleEventRepository lifecycleEventRepository)
    {
        _hrRecordRepository = hrRecordRepository;
        _lifecycleEventRepository = lifecycleEventRepository;
    }

    public async Task<Result<int>> Handle(SyncHRDataCommand request, CancellationToken cancellationToken)
    {
        var processedCount = 0;

        foreach (var recordDto in request.Records)
        {
            var existingRecord = await _hrRecordRepository.GetByExternalIdAsync(
                request.TenantId,
                recordDto.ExternalEmployeeId,
                cancellationToken);

            if (!Enum.TryParse<EmploymentStatus>(recordDto.EmploymentStatus, true, out var status))
                status = EmploymentStatus.Active;

            if (existingRecord == null)
            {
                // New joiner
                var newRecord = new HRIdentityRecord
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    ExternalEmployeeId = recordDto.ExternalEmployeeId,
                    FirstName = recordDto.FirstName,
                    LastName = recordDto.LastName,
                    Email = recordDto.Email,
                    OrgUnitCode = recordDto.OrgUnitCode,
                    JobRole = recordDto.JobRole,
                    ManagerEmployeeId = recordDto.ManagerEmployeeId,
                    Status = status,
                    StartDate = recordDto.StartDate,
                    EndDate = recordDto.EndDate,
                    LastSyncedAt = DateTime.UtcNow
                };

                await _hrRecordRepository.AddAsync(newRecord, cancellationToken);

                var joinerEvent = new LifecycleEvent
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    HRRecordId = newRecord.Id,
                    EventType = LifecycleEventType.Joiner,
                    OldSnapshotJson = "{}",
                    NewSnapshotJson = JsonSerializer.Serialize(newRecord),
                    Status = ProcessingStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                await _lifecycleEventRepository.AddAsync(joinerEvent, cancellationToken);
            }
            else
            {
                var oldSnapshot = JsonSerializer.Serialize(existingRecord);
                var hasChanges = false;
                var eventType = LifecycleEventType.Mover;

                // Check for status change (leaver)
                if (existingRecord.Status != status && status == EmploymentStatus.Terminated)
                {
                    eventType = LifecycleEventType.Leaver;
                    hasChanges = true;
                }
                // Check for role/org changes (mover)
                else if (existingRecord.OrgUnitCode != recordDto.OrgUnitCode ||
                         existingRecord.JobRole != recordDto.JobRole ||
                         existingRecord.ManagerEmployeeId != recordDto.ManagerEmployeeId)
                {
                    hasChanges = true;
                }

                // Update record
                existingRecord.FirstName = recordDto.FirstName;
                existingRecord.LastName = recordDto.LastName;
                existingRecord.Email = recordDto.Email;
                existingRecord.OrgUnitCode = recordDto.OrgUnitCode;
                existingRecord.JobRole = recordDto.JobRole;
                existingRecord.ManagerEmployeeId = recordDto.ManagerEmployeeId;
                existingRecord.Status = status;
                existingRecord.EndDate = recordDto.EndDate;
                existingRecord.LastSyncedAt = DateTime.UtcNow;

                await _hrRecordRepository.UpdateAsync(existingRecord, cancellationToken);

                if (hasChanges)
                {
                    var lifecycleEvent = new LifecycleEvent
                    {
                        Id = Guid.NewGuid(),
                        TenantId = request.TenantId,
                        HRRecordId = existingRecord.Id,
                        EventType = eventType,
                        OldSnapshotJson = oldSnapshot,
                        NewSnapshotJson = JsonSerializer.Serialize(existingRecord),
                        Status = ProcessingStatus.Pending,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _lifecycleEventRepository.AddAsync(lifecycleEvent, cancellationToken);
                }
            }

            processedCount++;
        }

        return Result.Success(processedCount);
    }
}
