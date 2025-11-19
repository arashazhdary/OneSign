using FluentAssertions;
using Moq;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Application.Queries;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Modules.Federation.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Federation;

public class GetScimTokensQueryHandlerTests
{
    private readonly Mock<IScimTokenRepository> _repositoryMock;
    private readonly GetScimTokensQueryHandler _handler;

    public GetScimTokensQueryHandlerTests()
    {
        _repositoryMock = new Mock<IScimTokenRepository>();
        _handler = new GetScimTokensQueryHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_TokensExist_ReturnsAllTokens()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };

        var tokens = new List<ScimToken>
        {
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Production Token",
                TokenHash = "hash1",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                ExpiresAt = DateTime.UtcNow.AddDays(335),
                LastUsedAt = DateTime.UtcNow.AddHours(-1)
            },
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Staging Token",
                TokenHash = "hash2",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                ExpiresAt = DateTime.UtcNow.AddDays(355)
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_NoTokens_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ScimToken>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_SingleToken_ReturnsSingleToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tokenId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };

        var tokens = new List<ScimToken>
        {
            new ScimToken
            {
                Id = tokenId,
                TenantId = tenantId,
                Name = "Single Token",
                TokenHash = "single-hash",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddYears(1)
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value![0].Id.Should().Be(tokenId);
        result.Value[0].Name.Should().Be("Single Token");
    }

    [Fact]
    public async Task Handle_ValidQuery_MapsAllFieldsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tokenId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-30);
        var expiresAt = DateTime.UtcNow.AddDays(335);
        var lastUsedAt = DateTime.UtcNow.AddMinutes(-30);
        var query = new GetScimTokensQuery { TenantId = tenantId };

        var tokens = new List<ScimToken>
        {
            new ScimToken
            {
                Id = tokenId,
                TenantId = tenantId,
                Name = "Mapping Test Token",
                TokenHash = "test-hash",
                Status = ScimTokenStatus.Active,
                CreatedAt = createdAt,
                ExpiresAt = expiresAt,
                LastUsedAt = lastUsedAt
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        var dto = result.Value![0];
        dto.Id.Should().Be(tokenId);
        dto.TenantId.Should().Be(tenantId);
        dto.Name.Should().Be("Mapping Test Token");
        dto.Status.Should().Be(ScimTokenStatus.Active);
        dto.CreatedAt.Should().Be(createdAt);
        dto.ExpiresAt.Should().Be(expiresAt);
        dto.LastUsedAt.Should().Be(lastUsedAt);
    }

    [Fact]
    public async Task Handle_ValidQuery_DoesNotExposePlainToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };

        var tokens = new List<ScimToken>
        {
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Secret Token",
                TokenHash = "hashed-secret-value",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddYears(1)
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        // PlainToken should NOT be populated in query results for security
        result.Value![0].PlainToken.Should().BeNull();
    }

    [Fact]
    public async Task Handle_CancellationRequested_PassesCancellationToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };
        var cts = new CancellationTokenSource();
        var token = cts.Token;

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, token))
            .ReturnsAsync(new List<ScimToken>());

        // Act
        var result = await _handler.Handle(query, token);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _repositoryMock.Verify(r => r.GetByTenantIdAsync(tenantId, token), Times.Once);
    }

    [Fact]
    public async Task Handle_AllTokenStatuses_ReturnedCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };

        var tokens = new List<ScimToken>
        {
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Active Token",
                TokenHash = "active-hash",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddYears(1)
            },
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Revoked Token",
                TokenHash = "revoked-hash",
                Status = ScimTokenStatus.Revoked,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                ExpiresAt = DateTime.UtcNow.AddDays(335)
            },
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Expired Token",
                TokenHash = "expired-hash",
                Status = ScimTokenStatus.Expired,
                CreatedAt = DateTime.UtcNow.AddDays(-400),
                ExpiresAt = DateTime.UtcNow.AddDays(-35)
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(3);
        result.Value!.Select(t => t.Status).Should().Contain(new[]
        {
            ScimTokenStatus.Active,
            ScimTokenStatus.Revoked,
            ScimTokenStatus.Expired
        });
    }

    [Fact]
    public async Task Handle_DifferentTenants_ReturnsOnlyRequestedTenantTokens()
    {
        // Arrange
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId1 };

        var tenant1Tokens = new List<ScimToken>
        {
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId1,
                Name = "Tenant 1 Token",
                TokenHash = "tenant1-hash",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddYears(1)
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant1Tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        result.Value![0].TenantId.Should().Be(tenantId1);
    }

    [Fact]
    public async Task Handle_TokensWithNullExpiresAt_HandlesCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };

        var tokens = new List<ScimToken>
        {
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Non-expiring Token",
                TokenHash = "never-expires-hash",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = null
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].ExpiresAt.Should().BeNull();
    }

    [Fact]
    public async Task Handle_TokensWithNullLastUsedAt_HandlesCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };

        var tokens = new List<ScimToken>
        {
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Never Used Token",
                TokenHash = "never-used-hash",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddYears(1),
                LastUsedAt = null
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].LastUsedAt.Should().BeNull();
    }

    [Fact]
    public async Task Handle_LargeNumberOfTokens_ReturnsAll()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };

        var statuses = new[]
        {
            ScimTokenStatus.Active,
            ScimTokenStatus.Revoked,
            ScimTokenStatus.Expired
        };

        var tokens = Enumerable.Range(1, 100).Select(i => new ScimToken
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = $"Token {i}",
            TokenHash = $"hash-{i}",
            Status = statuses[i % 3],
            CreatedAt = DateTime.UtcNow.AddDays(-i),
            ExpiresAt = i % 5 == 0 ? null : DateTime.UtcNow.AddDays(365 - i),
            LastUsedAt = i % 2 == 0 ? DateTime.UtcNow.AddHours(-i) : null
        }).ToList();

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(100);
    }

    [Fact]
    public async Task Handle_RecentlyUsedTokens_ReturnsCorrectLastUsedAt()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };
        var lastUsedAt = DateTime.UtcNow.AddMinutes(-5);

        var tokens = new List<ScimToken>
        {
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Recently Used Token",
                TokenHash = "recent-hash",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                ExpiresAt = DateTime.UtcNow.AddDays(335),
                LastUsedAt = lastUsedAt
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].LastUsedAt.Should().Be(lastUsedAt);
    }

    [Fact]
    public async Task Handle_MixedTokenExpirations_ReturnsAll()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetScimTokensQuery { TenantId = tenantId };

        var tokens = new List<ScimToken>
        {
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Short Expiration",
                TokenHash = "short-hash",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            },
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Long Expiration",
                TokenHash = "long-hash",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddYears(10)
            },
            new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "No Expiration",
                TokenHash = "no-exp-hash",
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = null
            }
        };

        _repositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tokens);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(3);
        result.Value!.Should().Contain(t => t.ExpiresAt == null);
        result.Value.Should().Contain(t => t.ExpiresAt.HasValue && t.ExpiresAt.Value < DateTime.UtcNow.AddDays(1));
        result.Value.Should().Contain(t => t.ExpiresAt.HasValue && t.ExpiresAt.Value > DateTime.UtcNow.AddYears(5));
    }
}
