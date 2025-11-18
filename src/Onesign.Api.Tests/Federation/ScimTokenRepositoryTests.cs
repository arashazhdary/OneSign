using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Modules.Federation.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class ScimTokenRepositoryTests
{
    private OnesignDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new OnesignDbContext(options);
    }

    [Fact]
    public async Task AddAsync_ValidToken_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);
        var tenantId = Guid.NewGuid();

        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Production Token",
            TokenHash = "hashed-token-value",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        // Act
        var result = await repository.AddAsync(token, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Production Token");
        result.Status.Should().Be(ScimTokenStatus.Active);
        result.ExpiresAt.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByIdAsync_ExistingToken_ReturnsToken()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);
        var tenantId = Guid.NewGuid();
        var tokenId = Guid.NewGuid();

        var token = new ScimToken
        {
            Id = tokenId,
            TenantId = tenantId,
            Name = "Test Token",
            TokenHash = "test-hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        await repository.AddAsync(token, CancellationToken.None);

        // Act
        var result = await repository.GetByIdAsync(tokenId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(tokenId);
        result.Name.Should().Be("Test Token");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingToken_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);

        // Act
        var result = await repository.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByTenantIdAsync_MultipleTokens_ReturnsAllForTenant()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);
        var tenantId = Guid.NewGuid();

        var token1 = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Token 1",
            TokenHash = "hash1",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        var token2 = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Token 2",
            TokenHash = "hash2",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMonths(6)
        };

        await repository.AddAsync(token1, CancellationToken.None);
        await repository.AddAsync(token2, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        results.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByTenantIdAsync_NoTokens_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);

        // Act
        var results = await repository.GetByTenantIdAsync(Guid.NewGuid(), CancellationToken.None);

        // Assert
        results.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByTenantIdAsync_DifferentTenants_ReturnsOnlyRequestedTenant()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();

        var token1 = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId1,
            Name = "Tenant 1 Token",
            TokenHash = "hash1",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        var token2 = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId2,
            Name = "Tenant 2 Token",
            TokenHash = "hash2",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        await repository.AddAsync(token1, CancellationToken.None);
        await repository.AddAsync(token2, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId1, CancellationToken.None);

        // Assert
        results.Should().HaveCount(1);
        results[0].TenantId.Should().Be(tenantId1);
    }

    [Fact]
    public async Task GetByTokenHashAsync_ExistingHash_ReturnsToken()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);
        var tenantId = Guid.NewGuid();
        var tokenHash = "unique-hash-value";

        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Hash Test Token",
            TokenHash = tokenHash,
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        await repository.AddAsync(token, CancellationToken.None);

        // Act
        var result = await repository.GetByTokenHashAsync(tokenHash, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.TokenHash.Should().Be(tokenHash);
    }

    [Fact]
    public async Task GetByTokenHashAsync_NonExistingHash_ReturnsNull()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);

        // Act
        var result = await repository.GetByTokenHashAsync("nonexistent-hash", CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_ExistingToken_UpdatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);
        var tenantId = Guid.NewGuid();
        var tokenId = Guid.NewGuid();

        var token = new ScimToken
        {
            Id = tokenId,
            TenantId = tenantId,
            Name = "Original Token",
            TokenHash = "original-hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            ExpiresAt = DateTime.UtcNow.AddDays(355)
        };

        await repository.AddAsync(token, CancellationToken.None);

        // Modify the token
        token.Revoke();
        token.UpdateLastUsed();

        // Act
        await repository.UpdateAsync(token, CancellationToken.None);

        // Retrieve and verify
        var updated = await repository.GetByIdAsync(tokenId, CancellationToken.None);

        // Assert
        updated.Should().NotBeNull();
        updated!.Status.Should().Be(ScimTokenStatus.Revoked);
        updated.LastUsedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteAsync_ExistingToken_DeletesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);
        var tenantId = Guid.NewGuid();
        var tokenId = Guid.NewGuid();

        var token = new ScimToken
        {
            Id = tokenId,
            TenantId = tenantId,
            Name = "Token to Delete",
            TokenHash = "delete-hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        await repository.AddAsync(token, CancellationToken.None);

        // Act
        await repository.DeleteAsync(tokenId, CancellationToken.None);

        // Verify deletion
        var deleted = await repository.GetByIdAsync(tokenId, CancellationToken.None);

        // Assert
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_NonExistingToken_DoesNotThrow()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);

        // Act & Assert - Should not throw
        await repository.Invoking(r => r.DeleteAsync(Guid.NewGuid(), CancellationToken.None))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task GetByTenantIdAsync_MixedStatuses_ReturnsAll()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);
        var tenantId = Guid.NewGuid();

        var activeToken = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Active Token",
            TokenHash = "active-hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        var revokedToken = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Revoked Token",
            TokenHash = "revoked-hash",
            Status = ScimTokenStatus.Revoked,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        };

        var expiredToken = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Expired Token",
            TokenHash = "expired-hash",
            Status = ScimTokenStatus.Expired,
            CreatedAt = DateTime.UtcNow.AddDays(-400),
            ExpiresAt = DateTime.UtcNow.AddDays(-35)
        };

        await repository.AddAsync(activeToken, CancellationToken.None);
        await repository.AddAsync(revokedToken, CancellationToken.None);
        await repository.AddAsync(expiredToken, CancellationToken.None);

        // Act
        var results = await repository.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        results.Should().HaveCount(3);
        results.Select(t => t.Status).Should().Contain(ScimTokenStatus.Active);
        results.Select(t => t.Status).Should().Contain(ScimTokenStatus.Revoked);
        results.Select(t => t.Status).Should().Contain(ScimTokenStatus.Expired);
    }

    [Fact]
    public async Task AddAsync_TokenWithNullExpiration_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);
        var tenantId = Guid.NewGuid();

        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Non-expiring Token",
            TokenHash = "never-expires-hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = null
        };

        // Act
        var result = await repository.AddAsync(token, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.ExpiresAt.Should().BeNull();

        // Verify persisted
        var retrieved = await repository.GetByIdAsync(result.Id, CancellationToken.None);
        retrieved!.ExpiresAt.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_UpdateLastUsed_PersistsCorrectly()
    {
        // Arrange
        using var context = CreateContext();
        var repository = new ScimTokenRepository(context);
        var tenantId = Guid.NewGuid();
        var tokenId = Guid.NewGuid();

        var token = new ScimToken
        {
            Id = tokenId,
            TenantId = tenantId,
            Name = "Last Used Test",
            TokenHash = "test-hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            ExpiresAt = DateTime.UtcNow.AddDays(335),
            LastUsedAt = null
        };

        await repository.AddAsync(token, CancellationToken.None);

        // Update last used
        token.UpdateLastUsed();

        // Act
        await repository.UpdateAsync(token, CancellationToken.None);

        // Retrieve and verify
        var updated = await repository.GetByIdAsync(tokenId, CancellationToken.None);

        // Assert
        updated.Should().NotBeNull();
        updated!.LastUsedAt.Should().NotBeNull();
    }
}
