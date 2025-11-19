using FluentAssertions;
using Moq;
using Onesign.Modules.MultiRegion.Application.Commands;
using Onesign.Modules.MultiRegion.Application.Handlers;
using Onesign.Modules.MultiRegion.Application.Queries;
using Onesign.Modules.MultiRegion.Domain.Entities;
using Onesign.Modules.MultiRegion.Domain.Enums;
using Onesign.Modules.MultiRegion.Domain.Repositories;

namespace Onesign.Api.Tests.MultiRegion;

public class MultiRegionHandlerTests
{
    private readonly Mock<IRegionRepository> _regionRepositoryMock;
    private readonly Mock<ITenantBackupSetRepository> _backupRepositoryMock;

    public MultiRegionHandlerTests()
    {
        _regionRepositoryMock = new Mock<IRegionRepository>();
        _backupRepositoryMock = new Mock<ITenantBackupSetRepository>();
    }

    #region CreateRegionCommandHandler Tests

    [Fact]
    public async Task CreateRegion_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new CreateRegionCommandHandler(_regionRepositoryMock.Object);

        var command = new CreateRegionCommand
        {
            Id = "eu-west-1",
            DisplayName = "Europe West 1",
            EndpointBaseUrl = "https://eu-west-1.example.com",
            DbClusterRef = "db-cluster-1",
            StorageClusterRef = "storage-cluster-1"
        };

        _regionRepositoryMock
            .Setup(x => x.GetByIdAsync("eu-west-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Region?)null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be("eu-west-1");
        _regionRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<Region>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateRegion_WithEmptyId_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateRegionCommandHandler(_regionRepositoryMock.Object);

        var command = new CreateRegionCommand
        {
            Id = "",
            DisplayName = "Test Region"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("InvalidId");
    }

    [Fact]
    public async Task CreateRegion_WithExistingId_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateRegionCommandHandler(_regionRepositoryMock.Object);

        var command = new CreateRegionCommand
        {
            Id = "eu-west-1",
            DisplayName = "Europe West 1"
        };

        _regionRepositoryMock
            .Setup(x => x.GetByIdAsync("eu-west-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Region { Id = "eu-west-1" });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("RegionExists");
    }

    [Fact]
    public async Task CreateRegion_SetsCorrectDefaultValues()
    {
        // Arrange
        var handler = new CreateRegionCommandHandler(_regionRepositoryMock.Object);

        var command = new CreateRegionCommand
        {
            Id = "eu-west-1",
            DisplayName = "Europe West 1",
            EndpointBaseUrl = "https://eu-west-1.example.com"
        };

        _regionRepositoryMock
            .Setup(x => x.GetByIdAsync("eu-west-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Region?)null);

        Region? savedRegion = null;
        _regionRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<Region>(), It.IsAny<CancellationToken>()))
            .Callback<Region, CancellationToken>((r, ct) => savedRegion = r)
            .Returns(Task.CompletedTask);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        savedRegion.Should().NotBeNull();
        savedRegion!.IsActive.Should().BeTrue();
        savedRegion.Status.Should().Be(RegionStatus.Healthy);
    }

    #endregion

    #region CreateTenantBackupCommandHandler Tests

    [Fact]
    public async Task CreateTenantBackup_WithActiveRegion_ReturnsSuccess()
    {
        // Arrange
        var handler = new CreateTenantBackupCommandHandler(
            _backupRepositoryMock.Object,
            _regionRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var command = new CreateTenantBackupCommand
        {
            TenantId = tenantId,
            BackupType = "LogicalExport"
        };

        var regions = new List<Region>
        {
            new Region
            {
                Id = "us-east-1",
                StorageClusterRef = "storage-1"
            }
        };

        _regionRepositoryMock
            .Setup(x => x.GetActiveAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(regions);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        _backupRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<TenantBackupSet>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateTenantBackup_WithNoActiveRegion_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateTenantBackupCommandHandler(
            _backupRepositoryMock.Object,
            _regionRepositoryMock.Object);

        var command = new CreateTenantBackupCommand
        {
            TenantId = Guid.NewGuid()
        };

        _regionRepositoryMock
            .Setup(x => x.GetActiveAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Region>());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("NoActiveRegion");
    }

    [Fact]
    public async Task CreateTenantBackup_SetsCorrectBackupStatus()
    {
        // Arrange
        var handler = new CreateTenantBackupCommandHandler(
            _backupRepositoryMock.Object,
            _regionRepositoryMock.Object);

        var command = new CreateTenantBackupCommand
        {
            TenantId = Guid.NewGuid()
        };

        _regionRepositoryMock
            .Setup(x => x.GetActiveAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Region> { new Region { Id = "us-east-1", StorageClusterRef = "storage" } });

        TenantBackupSet? savedBackup = null;
        _backupRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<TenantBackupSet>(), It.IsAny<CancellationToken>()))
            .Callback<TenantBackupSet, CancellationToken>((b, ct) => savedBackup = b)
            .Returns(Task.CompletedTask);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        savedBackup.Should().NotBeNull();
        savedBackup!.Status.Should().Be(BackupStatus.InProgress);
    }

    #endregion

    #region GetRegionsQueryHandler Tests

    [Fact]
    public async Task GetRegions_ReturnsAllRegions()
    {
        // Arrange
        var handler = new GetRegionsQueryHandler(_regionRepositoryMock.Object);

        var regions = new List<Region>
        {
            new Region { Id = "us-east-1", DisplayName = "US East", IsActive = true, Status = RegionStatus.Healthy },
            new Region { Id = "eu-west-1", DisplayName = "EU West", IsActive = false, Status = RegionStatus.Degraded }
        };

        var query = new GetRegionsQuery { ActiveOnly = false };

        _regionRepositoryMock
            .Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(regions);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetRegions_WithActiveOnlyFilter_ReturnsOnlyActiveRegions()
    {
        // Arrange
        var handler = new GetRegionsQueryHandler(_regionRepositoryMock.Object);

        var regions = new List<Region>
        {
            new Region { Id = "us-east-1", DisplayName = "US East", IsActive = true, Status = RegionStatus.Healthy }
        };

        var query = new GetRegionsQuery { ActiveOnly = true };

        _regionRepositoryMock
            .Setup(x => x.GetActiveAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(regions);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
    }

    #endregion

    #region GetTenantBackupsQueryHandler Tests

    [Fact]
    public async Task GetTenantBackups_ReturnsBackups()
    {
        // Arrange
        var handler = new GetTenantBackupsQueryHandler(_backupRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var backups = new List<TenantBackupSet>
        {
            new TenantBackupSet { Id = Guid.NewGuid(), TenantId = tenantId, Status = BackupStatus.Completed },
            new TenantBackupSet { Id = Guid.NewGuid(), TenantId = tenantId, Status = BackupStatus.InProgress }
        };

        var query = new GetTenantBackupsQuery { TenantId = tenantId };

        _backupRepositoryMock
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(backups);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetTenantBackups_MapsFieldsCorrectly()
    {
        // Arrange
        var handler = new GetTenantBackupsQueryHandler(_backupRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var backupId = Guid.NewGuid();
        var backups = new List<TenantBackupSet>
        {
            new TenantBackupSet
            {
                Id = backupId,
                TenantId = tenantId,
                RegionId = "us-east-1",
                BackupType = "LogicalExport",
                StorageLocation = "/backups/test",
                Status = BackupStatus.Completed,
                SizeBytes = 1024,
                CreatedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow
            }
        };

        var query = new GetTenantBackupsQuery { TenantId = tenantId };

        _backupRepositoryMock
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(backups);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var dto = result.Value![0];
        dto.Id.Should().Be(backupId);
        dto.TenantId.Should().Be(tenantId);
        dto.RegionId.Should().Be("us-east-1");
        dto.BackupType.Should().Be("LogicalExport");
        dto.Status.Should().Be("Completed");
        dto.SizeBytes.Should().Be(1024);
    }

    #endregion
}
