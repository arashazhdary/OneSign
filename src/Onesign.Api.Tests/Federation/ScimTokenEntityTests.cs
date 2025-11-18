using FluentAssertions;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class ScimTokenEntityTests
{
    [Fact]
    public void Constructor_CreatesTokenWithDefaultValues()
    {
        // Act
        var token = new ScimToken();

        // Assert
        token.Id.Should().Be(Guid.Empty);
        token.TenantId.Should().Be(Guid.Empty);
        token.Name.Should().BeEmpty();
        token.TokenHash.Should().BeEmpty();
        token.ExpiresAt.Should().BeNull();
        token.LastUsedAt.Should().BeNull();
    }

    [Fact]
    public void Revoke_ActiveToken_SetsStatusToRevoked()
    {
        // Arrange
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Active Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(1)
        };

        // Act
        token.Revoke();

        // Assert
        token.Status.Should().Be(ScimTokenStatus.Revoked);
    }

    [Fact]
    public void Revoke_AlreadyRevokedToken_RemainsRevoked()
    {
        // Arrange
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Revoked Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Revoked,
            CreatedAt = DateTime.UtcNow.AddDays(-30)
        };

        // Act
        token.Revoke();

        // Assert
        token.Status.Should().Be(ScimTokenStatus.Revoked);
    }

    [Fact]
    public void Revoke_ExpiredToken_SetsStatusToRevoked()
    {
        // Arrange
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Expired Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Expired,
            CreatedAt = DateTime.UtcNow.AddDays(-400),
            ExpiresAt = DateTime.UtcNow.AddDays(-35)
        };

        // Act
        token.Revoke();

        // Assert
        token.Status.Should().Be(ScimTokenStatus.Revoked);
    }

    [Fact]
    public void UpdateLastUsed_SetsLastUsedAtToCurrentTime()
    {
        // Arrange
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Test Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            ExpiresAt = DateTime.UtcNow.AddDays(335),
            LastUsedAt = null
        };

        // Act
        var beforeUpdate = DateTime.UtcNow;
        token.UpdateLastUsed();
        var afterUpdate = DateTime.UtcNow;

        // Assert
        token.LastUsedAt.Should().NotBeNull();
        token.LastUsedAt.Should().BeOnOrAfter(beforeUpdate);
        token.LastUsedAt.Should().BeOnOrBefore(afterUpdate);
    }

    [Fact]
    public void UpdateLastUsed_MultipleUpdates_UpdatesTimestampEachTime()
    {
        // Arrange
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Test Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            ExpiresAt = DateTime.UtcNow.AddDays(335)
        };

        // Act - First update
        token.UpdateLastUsed();
        var firstUpdateTime = token.LastUsedAt;

        // Small delay to ensure different timestamps
        Thread.Sleep(10);

        // Act - Second update
        token.UpdateLastUsed();
        var secondUpdateTime = token.LastUsedAt;

        // Assert
        firstUpdateTime.Should().NotBeNull();
        secondUpdateTime.Should().NotBeNull();
        secondUpdateTime.Should().BeAfter(firstUpdateTime!.Value);
    }

    [Fact]
    public void UpdateLastUsed_DoesNotAffectOtherFields()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var tokenHash = "original-hash";
        var createdAt = DateTime.UtcNow.AddDays(-30);
        var expiresAt = DateTime.UtcNow.AddDays(335);

        var token = new ScimToken
        {
            Id = id,
            TenantId = tenantId,
            Name = "Test Token",
            TokenHash = tokenHash,
            Status = ScimTokenStatus.Active,
            CreatedAt = createdAt,
            ExpiresAt = expiresAt
        };

        // Act
        token.UpdateLastUsed();

        // Assert - All other fields should remain unchanged
        token.Id.Should().Be(id);
        token.TenantId.Should().Be(tenantId);
        token.Name.Should().Be("Test Token");
        token.TokenHash.Should().Be(tokenHash);
        token.Status.Should().Be(ScimTokenStatus.Active);
        token.CreatedAt.Should().Be(createdAt);
        token.ExpiresAt.Should().Be(expiresAt);
    }

    [Fact]
    public void Revoke_DoesNotAffectOtherFields()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var tokenHash = "original-hash";
        var createdAt = DateTime.UtcNow.AddDays(-30);
        var expiresAt = DateTime.UtcNow.AddDays(335);
        var lastUsedAt = DateTime.UtcNow.AddHours(-1);

        var token = new ScimToken
        {
            Id = id,
            TenantId = tenantId,
            Name = "Test Token",
            TokenHash = tokenHash,
            Status = ScimTokenStatus.Active,
            CreatedAt = createdAt,
            ExpiresAt = expiresAt,
            LastUsedAt = lastUsedAt
        };

        // Act
        token.Revoke();

        // Assert - All other fields should remain unchanged
        token.Id.Should().Be(id);
        token.TenantId.Should().Be(tenantId);
        token.Name.Should().Be("Test Token");
        token.TokenHash.Should().Be(tokenHash);
        token.CreatedAt.Should().Be(createdAt);
        token.ExpiresAt.Should().Be(expiresAt);
        token.LastUsedAt.Should().Be(lastUsedAt);
    }

    [Fact]
    public void SetProperties_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-30);
        var expiresAt = DateTime.UtcNow.AddDays(335);
        var lastUsedAt = DateTime.UtcNow.AddHours(-1);

        // Act
        var token = new ScimToken
        {
            Id = id,
            TenantId = tenantId,
            Name = "Test Token",
            TokenHash = "test-hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = createdAt,
            ExpiresAt = expiresAt,
            LastUsedAt = lastUsedAt
        };

        // Assert
        token.Id.Should().Be(id);
        token.TenantId.Should().Be(tenantId);
        token.Name.Should().Be("Test Token");
        token.TokenHash.Should().Be("test-hash");
        token.Status.Should().Be(ScimTokenStatus.Active);
        token.CreatedAt.Should().Be(createdAt);
        token.ExpiresAt.Should().Be(expiresAt);
        token.LastUsedAt.Should().Be(lastUsedAt);
    }

    [Fact]
    public void AllTokenStatuses_CanBeAssigned()
    {
        // Arrange & Act & Assert
        var activeToken = new ScimToken { Status = ScimTokenStatus.Active };
        activeToken.Status.Should().Be(ScimTokenStatus.Active);

        var revokedToken = new ScimToken { Status = ScimTokenStatus.Revoked };
        revokedToken.Status.Should().Be(ScimTokenStatus.Revoked);

        var expiredToken = new ScimToken { Status = ScimTokenStatus.Expired };
        expiredToken.Status.Should().Be(ScimTokenStatus.Expired);
    }

    [Fact]
    public void ExpiresAt_CanBeNull_ForNeverExpiringTokens()
    {
        // Arrange
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Non-expiring Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = null
        };

        // Assert
        token.ExpiresAt.Should().BeNull();
    }

    [Fact]
    public void ExpiresAt_CanBeInPast_ForExpiredTokens()
    {
        // Arrange
        var expiresAt = DateTime.UtcNow.AddDays(-30);
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Expired Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Expired,
            CreatedAt = DateTime.UtcNow.AddDays(-400),
            ExpiresAt = expiresAt
        };

        // Assert
        token.ExpiresAt.Should().Be(expiresAt);
        token.ExpiresAt.Should().BeBefore(DateTime.UtcNow);
    }

    [Fact]
    public void ExpiresAt_CanBeInFuture_ForActiveTokens()
    {
        // Arrange
        var expiresAt = DateTime.UtcNow.AddYears(1);
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Active Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt
        };

        // Assert
        token.ExpiresAt.Should().Be(expiresAt);
        token.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }

    [Fact]
    public void TokenHash_StoresHashValue()
    {
        // Arrange
        var hash = "ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ";
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Hash Test",
            TokenHash = hash,
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        token.TokenHash.Should().Be(hash);
    }

    [Fact]
    public void Revoke_ThenUpdateLastUsed_BothOperationsWork()
    {
        // Arrange
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Test Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            ExpiresAt = DateTime.UtcNow.AddDays(335)
        };

        // Act
        token.Revoke();
        token.UpdateLastUsed();

        // Assert
        token.Status.Should().Be(ScimTokenStatus.Revoked);
        token.LastUsedAt.Should().NotBeNull();
    }

    [Fact]
    public void MultipleTokens_HaveIndependentState()
    {
        // Arrange
        var token1 = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Token 1",
            TokenHash = "hash1",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        var token2 = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Token 2",
            TokenHash = "hash2",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        token1.Revoke();
        token2.UpdateLastUsed();

        // Assert
        token1.Status.Should().Be(ScimTokenStatus.Revoked);
        token1.LastUsedAt.Should().BeNull();
        token2.Status.Should().Be(ScimTokenStatus.Active);
        token2.LastUsedAt.Should().NotBeNull();
    }

    [Fact]
    public void ShortExpirationPeriod_CanBeSet()
    {
        // Arrange
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Short-lived Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        };

        // Assert
        token.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddMinutes(30), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void LongExpirationPeriod_CanBeSet()
    {
        // Arrange
        var token = new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Long-lived Token",
            TokenHash = "hash",
            Status = ScimTokenStatus.Active,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(10)
        };

        // Assert
        token.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddYears(10), TimeSpan.FromSeconds(1));
    }
}
