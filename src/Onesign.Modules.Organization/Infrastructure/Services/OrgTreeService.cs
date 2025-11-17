using Microsoft.Extensions.Logging;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Services;

namespace Onesign.Modules.Organization.Infrastructure.Services;

public class OrgTreeService : IOrgTreeService
{
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly ILogger<OrgTreeService> _logger;

    public OrgTreeService(IOrgUnitRepository orgUnitRepository, ILogger<OrgTreeService> logger)
    {
        _orgUnitRepository = orgUnitRepository;
        _logger = logger;
    }

    public async Task<OrgUnit> CreateChildAsync(Guid tenantId, Guid? parentId, string name, string? code, int? sortOrder, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating OrgUnit child: TenantId={TenantId}, ParentId={ParentId}, Name={Name}", tenantId, parentId, name);

        // Validate parent if provided
        OrgUnit? parent = null;
        if (parentId.HasValue)
        {
            parent = await _orgUnitRepository.GetByIdAsync(parentId.Value, cancellationToken);
            if (parent == null || parent.TenantId != tenantId)
            {
                throw new InvalidOperationException("Parent OrgUnit not found or does not belong to tenant");
            }
        }

        // Calculate sort order if not provided
        if (!sortOrder.HasValue)
        {
            sortOrder = await _orgUnitRepository.GetMaxSortOrderForParentAsync(parentId, tenantId, cancellationToken) + 1;
        }

        // Generate path and level
        var path = await GeneratePathAsync(parentId, tenantId, cancellationToken);
        var level = await CalculateLevelAsync(parentId, cancellationToken);

        var orgUnit = new OrgUnit
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ParentId = parentId,
            Name = name,
            Code = code,
            Path = path,
            Level = level,
            SortOrder = sortOrder.Value,
            Status = Domain.Enums.OrgUnitStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

        var created = await _orgUnitRepository.AddAsync(orgUnit, cancellationToken);
        _logger.LogInformation("OrgUnit created: Id={Id}, Path={Path}", created.Id, created.Path);

        return created;
    }

    public async Task<OrgUnit> UpdateOrgUnitAsync(Guid orgUnitId, string name, string? code, int? sortOrder, Onesign.Modules.Organization.Domain.Enums.OrgUnitStatus status, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating OrgUnit: Id={Id}, Name={Name}", orgUnitId, name);

        var orgUnit = await _orgUnitRepository.GetByIdAsync(orgUnitId, cancellationToken);
        if (orgUnit == null)
        {
            throw new InvalidOperationException("OrgUnit not found");
        }

        orgUnit.Update(name, code, sortOrder ?? orgUnit.SortOrder, status);

        await _orgUnitRepository.UpdateAsync(orgUnit, cancellationToken);
        _logger.LogInformation("OrgUnit updated: Id={Id}", orgUnitId);

        return orgUnit;
    }

    public async Task MoveOrgUnitAsync(Guid orgUnitId, Guid? newParentId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Moving OrgUnit: Id={Id}, NewParentId={NewParentId}", orgUnitId, newParentId);

        var orgUnit = await _orgUnitRepository.GetByIdAsync(orgUnitId, cancellationToken);
        if (orgUnit == null)
        {
            throw new InvalidOperationException("OrgUnit not found");
        }

        // Validate new parent if provided
        if (newParentId.HasValue)
        {
            var newParent = await _orgUnitRepository.GetByIdAsync(newParentId.Value, cancellationToken);
            if (newParent == null || newParent.TenantId != orgUnit.TenantId)
            {
                throw new InvalidOperationException("New parent OrgUnit not found or does not belong to tenant");
            }

            // Prevent moving to a descendant
            var descendants = await _orgUnitRepository.GetDescendantsAsync(orgUnitId, cancellationToken);
            if (descendants.Any(d => d.Id == newParentId.Value))
            {
                throw new InvalidOperationException("Cannot move OrgUnit to its own descendant");
            }
        }

        // Update path and level for this org unit and all descendants
        var newPath = await GeneratePathAsync(newParentId, orgUnit.TenantId, cancellationToken);
        var newLevel = await CalculateLevelAsync(newParentId, cancellationToken);

        var oldPath = orgUnit.Path;
        orgUnit.ParentId = newParentId;
        orgUnit.Path = newPath;
        orgUnit.Level = newLevel;
        orgUnit.UpdatedAt = DateTime.UtcNow;

        await _orgUnitRepository.UpdateAsync(orgUnit, cancellationToken);

        // Update all descendants
        var allDescendants = await _orgUnitRepository.GetDescendantsAsync(orgUnitId, cancellationToken);
        foreach (var descendant in allDescendants.Where(d => d.Id != orgUnitId))
        {
            var relativePath = descendant.Path.Substring(oldPath.Length);
            descendant.Path = newPath + relativePath;
            descendant.Level = newLevel + (descendant.Level - orgUnit.Level);
            descendant.UpdatedAt = DateTime.UtcNow;
            await _orgUnitRepository.UpdateAsync(descendant, cancellationToken);
        }

        _logger.LogInformation("OrgUnit moved: Id={Id}, NewPath={NewPath}", orgUnitId, newPath);
    }

    public async Task DeleteOrgUnitAsync(Guid orgUnitId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting OrgUnit: Id={Id}", orgUnitId);

        var orgUnit = await _orgUnitRepository.GetByIdAsync(orgUnitId, cancellationToken);
        if (orgUnit == null)
        {
            throw new InvalidOperationException("OrgUnit not found");
        }

        // Check if it has children
        var hasChildren = await _orgUnitRepository.HasChildrenAsync(orgUnitId, cancellationToken);
        if (hasChildren)
        {
            throw new InvalidOperationException("Cannot delete OrgUnit with children");
        }

        await _orgUnitRepository.DeleteAsync(orgUnitId, cancellationToken);
        _logger.LogInformation("OrgUnit deleted: Id={Id}", orgUnitId);
    }

    public async Task<IReadOnlyList<OrgUnit>> GetTreeForTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var orgUnits = await _orgUnitRepository.GetByTenantIdAsync(tenantId, cancellationToken);
        return orgUnits;
    }

    public async Task<string> GeneratePathAsync(Guid? parentId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        if (!parentId.HasValue)
        {
            // Root node - use "000" format
            var root = await _orgUnitRepository.GetRootByTenantIdAsync(tenantId, cancellationToken);
            if (root != null)
            {
                return root.Path;
            }
            return "000";
        }

        var parent = await _orgUnitRepository.GetByIdAsync(parentId.Value, cancellationToken);
        if (parent == null)
        {
            throw new InvalidOperationException("Parent OrgUnit not found");
        }

        // Get siblings to determine next number
        var siblings = await _orgUnitRepository.GetChildrenAsync(parentId.Value, cancellationToken);
        var maxSiblingNumber = 0;
        if (siblings.Any())
        {
            var siblingPaths = siblings.Select(s => s.Path.Split('/').LastOrDefault()).Where(p => !string.IsNullOrEmpty(p));
            foreach (var siblingPathPart in siblingPaths)
            {
                if (int.TryParse(siblingPathPart, out var num) && num > maxSiblingNumber)
                {
                    maxSiblingNumber = num;
                }
            }
        }

        var nextNumber = maxSiblingNumber + 1;
        var pathPart = nextNumber.ToString("000");
        return $"{parent.Path}/{pathPart}";
    }

    public async Task<int> CalculateLevelAsync(Guid? parentId, CancellationToken cancellationToken = default)
    {
        if (!parentId.HasValue)
        {
            return 0; // Root level
        }

        var parent = await _orgUnitRepository.GetByIdAsync(parentId.Value, CancellationToken.None);
        if (parent == null)
        {
            throw new InvalidOperationException("Parent OrgUnit not found");
        }

        return parent.Level + 1;
    }
}

