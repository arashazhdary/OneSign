using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Enums;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Modules.IdentityLifecycle.Domain.Services;

namespace Onesign.Modules.IdentityLifecycle.Infrastructure.Services;

public class LifecycleProcessorService : ILifecycleProcessor
{
    private readonly ILifecycleEventRepository _eventRepository;
    private readonly IHRIdentityRecordRepository _hrRepository;
    private readonly ILifecyclePolicyEvaluator _policyEvaluator;
    private readonly ILogger<LifecycleProcessorService> _logger;

    public LifecycleProcessorService(
        ILifecycleEventRepository eventRepository,
        IHRIdentityRecordRepository hrRepository,
        ILifecyclePolicyEvaluator policyEvaluator,
        ILogger<LifecycleProcessorService> logger)
    {
        _eventRepository = eventRepository;
        _hrRepository = hrRepository;
        _policyEvaluator = policyEvaluator;
        _logger = logger;
    }

    public async Task ProcessJoinerAsync(LifecycleEvent lifecycleEvent, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing Joiner event {EventId} for user {UserId}",
            lifecycleEvent.Id, lifecycleEvent.UserId);

        try
        {
            var hrRecord = await _hrRepository.GetByUserIdAsync(lifecycleEvent.TenantId, lifecycleEvent.UserId, cancellationToken);
            if (hrRecord == null)
            {
                throw new InvalidOperationException($"HR record not found for user {lifecycleEvent.UserId}");
            }

            // Evaluate policies to determine access packages
            var packages = await _policyEvaluator.EvaluatePoliciesForUserAsync(
                lifecycleEvent.TenantId,
                hrRecord,
                cancellationToken);

            // Provision access based on packages
            foreach (var package in packages)
            {
                var roleIds = JsonSerializer.Deserialize<List<Guid>>(package.RoleIdsJson) ?? new();
                var appIds = JsonSerializer.Deserialize<List<Guid>>(package.ApplicationIdsJson) ?? new();

                _logger.LogInformation(
                    "Provisioning package {PackageName}: {RoleCount} roles, {AppCount} applications for user {UserId}",
                    package.Name, roleIds.Count, appIds.Count, lifecycleEvent.UserId);

                // In a real implementation, this would call the actual provisioning systems
                // to grant roles, add to groups, create application accounts, etc.
            }

            lifecycleEvent.Status = ProcessingStatus.Completed;
            lifecycleEvent.ProcessedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(lifecycleEvent, cancellationToken);
            _logger.LogInformation("Joiner event {EventId} processed successfully", lifecycleEvent.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process Joiner event {EventId}", lifecycleEvent.Id);
            lifecycleEvent.Status = ProcessingStatus.Failed;
            lifecycleEvent.ErrorMessage = ex.Message;
            lifecycleEvent.ProcessedAt = DateTime.UtcNow;
            await _eventRepository.UpdateAsync(lifecycleEvent, cancellationToken);
        }
    }

    public async Task ProcessMoverAsync(LifecycleEvent lifecycleEvent, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing Mover event {EventId} for user {UserId}",
            lifecycleEvent.Id, lifecycleEvent.UserId);

        try
        {
            var hrRecord = await _hrRepository.GetByUserIdAsync(lifecycleEvent.TenantId, lifecycleEvent.UserId, cancellationToken);
            if (hrRecord == null)
            {
                throw new InvalidOperationException($"HR record not found for user {lifecycleEvent.UserId}");
            }

            // Get old packages (based on previous state) to revoke
            // Get new packages (based on new state) to grant
            var newPackages = await _policyEvaluator.EvaluatePoliciesForUserAsync(
                lifecycleEvent.TenantId,
                hrRecord,
                cancellationToken);

            _logger.LogInformation(
                "Mover event: transitioning user {UserId} from {OldState} to {NewState}, granting {PackageCount} new packages",
                lifecycleEvent.UserId,
                lifecycleEvent.PreviousState,
                lifecycleEvent.NewState,
                newPackages.Count);

            // In a real implementation:
            // 1. Revoke access from old packages
            // 2. Grant access from new packages
            // 3. Handle any overlapping access appropriately

            foreach (var package in newPackages)
            {
                _logger.LogInformation("Provisioning package {PackageName} for moved user {UserId}",
                    package.Name, lifecycleEvent.UserId);
            }

            lifecycleEvent.Status = ProcessingStatus.Completed;
            lifecycleEvent.ProcessedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(lifecycleEvent, cancellationToken);
            _logger.LogInformation("Mover event {EventId} processed successfully", lifecycleEvent.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process Mover event {EventId}", lifecycleEvent.Id);
            lifecycleEvent.Status = ProcessingStatus.Failed;
            lifecycleEvent.ErrorMessage = ex.Message;
            lifecycleEvent.ProcessedAt = DateTime.UtcNow;
            await _eventRepository.UpdateAsync(lifecycleEvent, cancellationToken);
        }
    }

    public async Task ProcessLeaverAsync(LifecycleEvent lifecycleEvent, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Processing Leaver event {EventId} for user {UserId}",
            lifecycleEvent.Id, lifecycleEvent.UserId);

        try
        {
            // Leaver processing: revoke all access
            // In a real implementation, this would:
            // 1. Disable user account
            // 2. Revoke all role assignments
            // 3. Remove from all groups
            // 4. Revoke application access
            // 5. Revoke any JIT grants
            // 6. Transfer ownership of resources

            _logger.LogInformation("Revoking all access for leaving user {UserId}", lifecycleEvent.UserId);

            lifecycleEvent.Status = ProcessingStatus.Completed;
            lifecycleEvent.ProcessedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(lifecycleEvent, cancellationToken);
            _logger.LogInformation("Leaver event {EventId} processed successfully", lifecycleEvent.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process Leaver event {EventId}", lifecycleEvent.Id);
            lifecycleEvent.Status = ProcessingStatus.Failed;
            lifecycleEvent.ErrorMessage = ex.Message;
            lifecycleEvent.ProcessedAt = DateTime.UtcNow;
            await _eventRepository.UpdateAsync(lifecycleEvent, cancellationToken);
        }
    }
}
