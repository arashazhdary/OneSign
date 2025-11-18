using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Entities;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Privacy;

public class DataRetentionPolicyRepositoryTests
{
    private DbContextOptions<TestPrivacyDbContext> CreateOptions()
    {
        return new DbContextOptionsBuilder<TestPrivacyDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task GetByIdAsync_ExistingPolicy_ReturnsPolicy()
    {
        // Arrange
        var options = CreateOptions();
        var policyId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataRetentionPolicies.Add(new DataRetentionPolicyEntity
            {
                Id = policyId,
                TenantId = tenantId,
                DataCategory = (int)DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            var result = await repository.GetByIdAsync(policyId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(policyId);
            result.TenantId.Should().Be(tenantId);
            result.DataCategory.Should().Be(DataCategory.IdentityProfile);
            result.RetentionPeriodDays.Should().Be(365);
            result.HardDeleteAfter.Should().BeTrue();
            result.Enabled.Should().BeTrue();
        }
    }

    [Fact]
    public async Task GetByIdAsync_NonExistentPolicy_ReturnsNull()
    {
        // Arrange
        var options = CreateOptions();

        using var context = new TestPrivacyDbContext(options);
        var repository = new DataRetentionPolicyRepository(context);

        // Act
        var result = await repository.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByTenantIdAsync_WithPolicies_ReturnsOrderedByCategory()
    {
        // Arrange
        var options = CreateOptions();
        var tenantId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataRetentionPolicies.AddRange(
                new DataRetentionPolicyEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    DataCategory = (int)DataCategory.AuditLogs,
                    RetentionPeriodDays = 180,
                    HardDeleteAfter = false,
                    Enabled = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new DataRetentionPolicyEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    DataCategory = (int)DataCategory.IdentityProfile,
                    RetentionPeriodDays = 365,
                    HardDeleteAfter = true,
                    Enabled = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new DataRetentionPolicyEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    DataCategory = (int)DataCategory.AuthEvents,
                    RetentionPeriodDays = 90,
                    HardDeleteAfter = false,
                    Enabled = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            var results = await repository.GetByTenantIdAsync(tenantId);

            // Assert
            results.Should().HaveCount(3);
            results[0].DataCategory.Should().Be(DataCategory.IdentityProfile);
            results[1].DataCategory.Should().Be(DataCategory.AuthEvents);
            results[2].DataCategory.Should().Be(DataCategory.AuditLogs);
        }
    }

    [Fact]
    public async Task GetByTenantIdAsync_DifferentTenant_ReturnsEmpty()
    {
        // Arrange
        var options = CreateOptions();
        var tenantId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataRetentionPolicies.Add(new DataRetentionPolicyEntity
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = (int)DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            var results = await repository.GetByTenantIdAsync(Guid.NewGuid());

            // Assert
            results.Should().BeEmpty();
        }
    }

    [Fact]
    public async Task GetByTenantAndCategoryAsync_ExistingPolicy_ReturnsPolicy()
    {
        // Arrange
        var options = CreateOptions();
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataRetentionPolicies.Add(new DataRetentionPolicyEntity
            {
                Id = policyId,
                TenantId = tenantId,
                DataCategory = (int)DataCategory.AuditLogs,
                RetentionPeriodDays = 180,
                HardDeleteAfter = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            var result = await repository.GetByTenantAndCategoryAsync(tenantId, DataCategory.AuditLogs);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(policyId);
            result.DataCategory.Should().Be(DataCategory.AuditLogs);
        }
    }

    [Fact]
    public async Task GetByTenantAndCategoryAsync_NonExistentCombination_ReturnsNull()
    {
        // Arrange
        var options = CreateOptions();
        var tenantId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataRetentionPolicies.Add(new DataRetentionPolicyEntity
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = (int)DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            var result = await repository.GetByTenantAndCategoryAsync(tenantId, DataCategory.FederationLogs);

            // Assert
            result.Should().BeNull();
        }
    }

    [Fact]
    public async Task GetEnabledAsync_ReturnsOnlyEnabled()
    {
        // Arrange
        var options = CreateOptions();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataRetentionPolicies.AddRange(
                new DataRetentionPolicyEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    DataCategory = (int)DataCategory.IdentityProfile,
                    RetentionPeriodDays = 365,
                    HardDeleteAfter = true,
                    Enabled = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new DataRetentionPolicyEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    DataCategory = (int)DataCategory.AuditLogs,
                    RetentionPeriodDays = 180,
                    HardDeleteAfter = false,
                    Enabled = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new DataRetentionPolicyEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    DataCategory = (int)DataCategory.AuthEvents,
                    RetentionPeriodDays = 90,
                    HardDeleteAfter = true,
                    Enabled = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            var results = await repository.GetEnabledAsync();

            // Assert
            results.Should().HaveCount(2);
            results.All(p => p.Enabled).Should().BeTrue();
        }
    }

    [Fact]
    public async Task AddAsync_ValidPolicy_SavesSuccessfully()
    {
        // Arrange
        var options = CreateOptions();
        var policy = new DataRetentionPolicy
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            DataCategory = DataCategory.FederationLogs,
            RetentionPeriodDays = 120,
            HardDeleteAfter = true,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            await repository.AddAsync(policy);
        }

        // Assert
        using (var context = new TestPrivacyDbContext(options))
        {
            var saved = await context.DataRetentionPolicies.FirstOrDefaultAsync(x => x.Id == policy.Id);
            saved.Should().NotBeNull();
            saved!.DataCategory.Should().Be((int)DataCategory.FederationLogs);
            saved.RetentionPeriodDays.Should().Be(120);
        }
    }

    [Fact]
    public async Task UpdateAsync_ExistingPolicy_UpdatesSuccessfully()
    {
        // Arrange
        var options = CreateOptions();
        var policyId = Guid.NewGuid();
        var originalUpdatedAt = DateTime.UtcNow.AddDays(-1);

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataRetentionPolicies.Add(new DataRetentionPolicyEntity
            {
                Id = policyId,
                TenantId = Guid.NewGuid(),
                DataCategory = (int)DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                UpdatedAt = originalUpdatedAt
            });
            await context.SaveChangesAsync();
        }

        var newUpdatedAt = DateTime.UtcNow;
        var updatedPolicy = new DataRetentionPolicy
        {
            Id = policyId,
            RetentionPeriodDays = 730,
            HardDeleteAfter = false,
            Enabled = false,
            UpdatedAt = newUpdatedAt
        };

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            await repository.UpdateAsync(updatedPolicy);
        }

        // Assert
        using (var context = new TestPrivacyDbContext(options))
        {
            var saved = await context.DataRetentionPolicies.FirstOrDefaultAsync(x => x.Id == policyId);
            saved.Should().NotBeNull();
            saved!.RetentionPeriodDays.Should().Be(730);
            saved.HardDeleteAfter.Should().BeFalse();
            saved.Enabled.Should().BeFalse();
            saved.UpdatedAt.Should().Be(newUpdatedAt);
        }
    }

    [Fact]
    public async Task UpdateAsync_NonExistentPolicy_DoesNothing()
    {
        // Arrange
        var options = CreateOptions();
        var policy = new DataRetentionPolicy
        {
            Id = Guid.NewGuid(),
            RetentionPeriodDays = 100,
            HardDeleteAfter = true,
            Enabled = true,
            UpdatedAt = DateTime.UtcNow
        };

        // Act & Assert - Should not throw
        using var context = new TestPrivacyDbContext(options);
        var repository = new DataRetentionPolicyRepository(context);
        await repository.UpdateAsync(policy);
    }

    [Fact]
    public async Task DeleteAsync_ExistingPolicy_RemovesSuccessfully()
    {
        // Arrange
        var options = CreateOptions();
        var policyId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataRetentionPolicies.Add(new DataRetentionPolicyEntity
            {
                Id = policyId,
                TenantId = Guid.NewGuid(),
                DataCategory = (int)DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            await repository.DeleteAsync(policyId);
        }

        // Assert
        using (var context = new TestPrivacyDbContext(options))
        {
            var deleted = await context.DataRetentionPolicies.FirstOrDefaultAsync(x => x.Id == policyId);
            deleted.Should().BeNull();
        }
    }

    [Fact]
    public async Task DeleteAsync_NonExistentPolicy_DoesNothing()
    {
        // Arrange
        var options = CreateOptions();

        // Act & Assert - Should not throw
        using var context = new TestPrivacyDbContext(options);
        var repository = new DataRetentionPolicyRepository(context);
        await repository.DeleteAsync(Guid.NewGuid());
    }

    [Theory]
    [InlineData(DataCategory.IdentityProfile)]
    [InlineData(DataCategory.AuthEvents)]
    [InlineData(DataCategory.AuditLogs)]
    [InlineData(DataCategory.FederationLogs)]
    [InlineData(DataCategory.AccessRequests)]
    [InlineData(DataCategory.LifecycleHistory)]
    public async Task GetByTenantAndCategoryAsync_AllCategories_Work(DataCategory category)
    {
        // Arrange
        var options = CreateOptions();
        var tenantId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataRetentionPolicies.Add(new DataRetentionPolicyEntity
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DataCategory = (int)category,
                RetentionPeriodDays = 90,
                HardDeleteAfter = false,
                Enabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            var result = await repository.GetByTenantAndCategoryAsync(tenantId, category);

            // Assert
            result.Should().NotBeNull();
            result!.DataCategory.Should().Be(category);
        }
    }

    [Fact]
    public async Task GetEnabledAsync_NoEnabledPolicies_ReturnsEmpty()
    {
        // Arrange
        var options = CreateOptions();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataRetentionPolicies.Add(new DataRetentionPolicyEntity
            {
                Id = Guid.NewGuid(),
                TenantId = Guid.NewGuid(),
                DataCategory = (int)DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataRetentionPolicyRepository(context);
            var results = await repository.GetEnabledAsync();

            // Assert
            results.Should().BeEmpty();
        }
    }

    [Fact]
    public async Task GetByTenantIdAsync_EmptyDatabase_ReturnsEmpty()
    {
        // Arrange
        var options = CreateOptions();

        // Act
        using var context = new TestPrivacyDbContext(options);
        var repository = new DataRetentionPolicyRepository(context);
        var results = await repository.GetByTenantIdAsync(Guid.NewGuid());

        // Assert
        results.Should().BeEmpty();
    }
}
