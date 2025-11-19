using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Crypto.Application.Queries;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

namespace Onesign.Api.Tests.Crypto;

public class CryptoQueryHandlerTests
{
    private readonly DbContext _dbContext;
    private readonly Mock<ILogger<GetKeySetsQueryHandler>> _keySetsLoggerMock;
    private readonly Mock<ILogger<GetKeySetByIdQueryHandler>> _keySetByIdLoggerMock;
    private readonly Mock<ILogger<GetRotationPoliciesQueryHandler>> _rotationPoliciesLoggerMock;

    public CryptoQueryHandlerTests()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new TestDbContext(options);
        _keySetsLoggerMock = new Mock<ILogger<GetKeySetsQueryHandler>>();
        _keySetByIdLoggerMock = new Mock<ILogger<GetKeySetByIdQueryHandler>>();
        _rotationPoliciesLoggerMock = new Mock<ILogger<GetRotationPoliciesQueryHandler>>();
    }

    #region GetKeySetsQueryHandler Tests

    [Fact]
    public async Task GetKeySets_WithNoFilters_ReturnsAllKeySets()
    {
        // Arrange
        var keySet1 = new KeySetEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.System,
            ScopeId = "system",
            Purpose = (int)KeyPurpose.Signing,
            IsDefaultForScope = true,
            CreatedAt = DateTime.UtcNow
        };

        var keySet2 = new KeySetEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.Tenant,
            ScopeId = "tenant-1",
            Purpose = (int)KeyPurpose.Encryption,
            IsDefaultForScope = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<KeySetEntity>().AddRange(keySet1, keySet2);
        await _dbContext.SaveChangesAsync();

        var handler = new GetKeySetsQueryHandler(_dbContext, _keySetsLoggerMock.Object);
        var query = new GetKeySetsQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetKeySets_WithScopeTypeFilter_ReturnsFilteredKeySets()
    {
        // Arrange
        var keySet1 = new KeySetEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.System,
            ScopeId = "system",
            Purpose = (int)KeyPurpose.Signing,
            IsDefaultForScope = true,
            CreatedAt = DateTime.UtcNow
        };

        var keySet2 = new KeySetEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.Tenant,
            ScopeId = "tenant-1",
            Purpose = (int)KeyPurpose.Encryption,
            IsDefaultForScope = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<KeySetEntity>().AddRange(keySet1, keySet2);
        await _dbContext.SaveChangesAsync();

        var handler = new GetKeySetsQueryHandler(_dbContext, _keySetsLoggerMock.Object);
        var query = new GetKeySetsQuery { ScopeType = KeyScopeType.System };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].ScopeType.Should().Be(KeyScopeType.System);
    }

    [Fact]
    public async Task GetKeySets_WithScopeIdFilter_ReturnsFilteredKeySets()
    {
        // Arrange
        var keySet1 = new KeySetEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.Tenant,
            ScopeId = "tenant-1",
            Purpose = (int)KeyPurpose.Signing,
            IsDefaultForScope = true,
            CreatedAt = DateTime.UtcNow
        };

        var keySet2 = new KeySetEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.Tenant,
            ScopeId = "tenant-2",
            Purpose = (int)KeyPurpose.Encryption,
            IsDefaultForScope = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<KeySetEntity>().AddRange(keySet1, keySet2);
        await _dbContext.SaveChangesAsync();

        var handler = new GetKeySetsQueryHandler(_dbContext, _keySetsLoggerMock.Object);
        var query = new GetKeySetsQuery { ScopeId = "tenant-1" };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].ScopeId.Should().Be("tenant-1");
    }

    [Fact]
    public async Task GetKeySets_WithPurposeFilter_ReturnsFilteredKeySets()
    {
        // Arrange
        var keySet1 = new KeySetEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.System,
            ScopeId = "system",
            Purpose = (int)KeyPurpose.Signing,
            IsDefaultForScope = true,
            CreatedAt = DateTime.UtcNow
        };

        var keySet2 = new KeySetEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.Tenant,
            ScopeId = "tenant-1",
            Purpose = (int)KeyPurpose.Encryption,
            IsDefaultForScope = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<KeySetEntity>().AddRange(keySet1, keySet2);
        await _dbContext.SaveChangesAsync();

        var handler = new GetKeySetsQueryHandler(_dbContext, _keySetsLoggerMock.Object);
        var query = new GetKeySetsQuery { Purpose = KeyPurpose.Signing };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].Purpose.Should().Be(KeyPurpose.Signing);
    }

    [Fact]
    public async Task GetKeySets_IncludesActiveKeyVersionCount()
    {
        // Arrange
        var keySetId = Guid.NewGuid();
        var keySet = new KeySetEntity
        {
            Id = keySetId,
            ScopeType = (int)KeyScopeType.System,
            ScopeId = "system",
            Purpose = (int)KeyPurpose.Signing,
            IsDefaultForScope = true,
            CreatedAt = DateTime.UtcNow
        };

        var keyVersion1 = new KeyVersionEntity
        {
            Id = Guid.NewGuid(),
            KeySetId = keySetId,
            Kid = "key-1",
            Algorithm = "RS256",
            State = (int)KeyVersionState.Active,
            CreatedAt = DateTime.UtcNow,
            ActivatedAt = DateTime.UtcNow
        };

        var keyVersion2 = new KeyVersionEntity
        {
            Id = Guid.NewGuid(),
            KeySetId = keySetId,
            Kid = "key-2",
            Algorithm = "RS256",
            State = (int)KeyVersionState.Active,
            CreatedAt = DateTime.UtcNow,
            ActivatedAt = DateTime.UtcNow
        };

        _dbContext.Set<KeySetEntity>().Add(keySet);
        _dbContext.Set<KeyVersionEntity>().AddRange(keyVersion1, keyVersion2);
        await _dbContext.SaveChangesAsync();

        var handler = new GetKeySetsQueryHandler(_dbContext, _keySetsLoggerMock.Object);
        var query = new GetKeySetsQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].ActiveKeyVersionsCount.Should().Be(2);
    }

    #endregion

    #region GetKeySetByIdQueryHandler Tests

    [Fact]
    public async Task GetKeySetById_WithExistingKeySet_ReturnsKeySetDetail()
    {
        // Arrange
        var keySetId = Guid.NewGuid();
        var keySet = new KeySetEntity
        {
            Id = keySetId,
            ScopeType = (int)KeyScopeType.System,
            ScopeId = "system",
            Purpose = (int)KeyPurpose.Signing,
            IsDefaultForScope = true,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<KeySetEntity>().Add(keySet);
        await _dbContext.SaveChangesAsync();

        var handler = new GetKeySetByIdQueryHandler(_dbContext, _keySetByIdLoggerMock.Object);
        var query = new GetKeySetByIdQuery { KeySetId = keySetId };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Id.Should().Be(keySetId);
        result.Value.ScopeType.Should().Be(KeyScopeType.System);
    }

    [Fact]
    public async Task GetKeySetById_WithNonExistingKeySet_ReturnsFailure()
    {
        // Arrange
        var handler = new GetKeySetByIdQueryHandler(_dbContext, _keySetByIdLoggerMock.Object);
        var query = new GetKeySetByIdQuery { KeySetId = Guid.NewGuid() };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("KEY_SET_NOT_FOUND");
    }

    [Fact]
    public async Task GetKeySetById_IncludesKeyVersions()
    {
        // Arrange
        var keySetId = Guid.NewGuid();
        var keySet = new KeySetEntity
        {
            Id = keySetId,
            ScopeType = (int)KeyScopeType.System,
            ScopeId = "system",
            Purpose = (int)KeyPurpose.Signing,
            IsDefaultForScope = true,
            CreatedAt = DateTime.UtcNow
        };

        var keyVersion = new KeyVersionEntity
        {
            Id = Guid.NewGuid(),
            KeySetId = keySetId,
            Kid = "key-1",
            Algorithm = "RS256",
            State = (int)KeyVersionState.Active,
            CreatedAt = DateTime.UtcNow,
            ActivatedAt = DateTime.UtcNow
        };

        _dbContext.Set<KeySetEntity>().Add(keySet);
        _dbContext.Set<KeyVersionEntity>().Add(keyVersion);
        await _dbContext.SaveChangesAsync();

        var handler = new GetKeySetByIdQueryHandler(_dbContext, _keySetByIdLoggerMock.Object);
        var query = new GetKeySetByIdQuery { KeySetId = keySetId };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.KeyVersions.Should().HaveCount(1);
        result.Value.KeyVersions[0].Kid.Should().Be("key-1");
    }

    #endregion

    #region GetRotationPoliciesQueryHandler Tests

    [Fact]
    public async Task GetRotationPolicies_WithNoFilters_ReturnsAllPolicies()
    {
        // Arrange
        var policy1 = new KeyRotationPolicyEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.System,
            ScopeId = "system",
            Purpose = (int)KeyPurpose.Signing,
            RotationPeriodDays = 90,
            OverlapPeriodDays = 7,
            Enabled = true
        };

        var policy2 = new KeyRotationPolicyEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.Tenant,
            ScopeId = "tenant-1",
            Purpose = (int)KeyPurpose.Encryption,
            RotationPeriodDays = 30,
            OverlapPeriodDays = 3,
            Enabled = false
        };

        _dbContext.Set<KeyRotationPolicyEntity>().AddRange(policy1, policy2);
        await _dbContext.SaveChangesAsync();

        var handler = new GetRotationPoliciesQueryHandler(_dbContext, _rotationPoliciesLoggerMock.Object);
        var query = new GetRotationPoliciesQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetRotationPolicies_WithEnabledFilter_ReturnsFilteredPolicies()
    {
        // Arrange
        var policy1 = new KeyRotationPolicyEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.System,
            ScopeId = "system",
            Purpose = (int)KeyPurpose.Signing,
            RotationPeriodDays = 90,
            OverlapPeriodDays = 7,
            Enabled = true
        };

        var policy2 = new KeyRotationPolicyEntity
        {
            Id = Guid.NewGuid(),
            ScopeType = (int)KeyScopeType.Tenant,
            ScopeId = "tenant-1",
            Purpose = (int)KeyPurpose.Encryption,
            RotationPeriodDays = 30,
            OverlapPeriodDays = 3,
            Enabled = false
        };

        _dbContext.Set<KeyRotationPolicyEntity>().AddRange(policy1, policy2);
        await _dbContext.SaveChangesAsync();

        var handler = new GetRotationPoliciesQueryHandler(_dbContext, _rotationPoliciesLoggerMock.Object);
        var query = new GetRotationPoliciesQuery { Enabled = true };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].Enabled.Should().BeTrue();
    }

    [Fact]
    public async Task GetRotationPolicies_MapsFieldsCorrectly()
    {
        // Arrange
        var policyId = Guid.NewGuid();
        var policy = new KeyRotationPolicyEntity
        {
            Id = policyId,
            ScopeType = (int)KeyScopeType.System,
            ScopeId = "system",
            Purpose = (int)KeyPurpose.Signing,
            RotationPeriodDays = 90,
            OverlapPeriodDays = 7,
            Enabled = true
        };

        _dbContext.Set<KeyRotationPolicyEntity>().Add(policy);
        await _dbContext.SaveChangesAsync();

        var handler = new GetRotationPoliciesQueryHandler(_dbContext, _rotationPoliciesLoggerMock.Object);
        var query = new GetRotationPoliciesQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        var dto = result[0];
        dto.Id.Should().Be(policyId);
        dto.ScopeType.Should().Be(KeyScopeType.System);
        dto.ScopeId.Should().Be("system");
        dto.Purpose.Should().Be(KeyPurpose.Signing);
        dto.RotationPeriodDays.Should().Be(90);
        dto.OverlapPeriodDays.Should().Be(7);
        dto.Enabled.Should().BeTrue();
    }

    #endregion
}

public class TestDbContext : DbContext
{
    public TestDbContext(DbContextOptions options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<KeySetEntity>().ToTable("KeySets");
        modelBuilder.Entity<KeyVersionEntity>().ToTable("KeyVersions");
        modelBuilder.Entity<KeyRotationPolicyEntity>().ToTable("KeyRotationPolicies");
    }
}
