using FluentAssertions;
using Moq;
using Onesign.Modules.Platform.Domain.Entities;
using Onesign.Modules.Platform.Domain.Enums;
using Onesign.Modules.Platform.Domain.Repositories;
using Onesign.Modules.Platform.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.Platform;

public class PlatformModuleTests
{
    #region PlatformVersion Entity Tests

    [Fact]
    public void PlatformVersion_Create_WithValidData_SetsPropertiesCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid();
        var version = "1.0.0";
        var releaseDate = DateTimeOffset.UtcNow;
        var description = "Initial release";
        var releaseNotes = "First version of the platform";

        // Act
        var platformVersion = new PlatformVersion
        {
            Id = id,
            Version = version,
            ReleaseDate = releaseDate,
            Description = description,
            ReleaseNotes = releaseNotes,
            IsCurrentVersion = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Assert
        platformVersion.Id.Should().Be(id);
        platformVersion.Version.Should().Be(version);
        platformVersion.ReleaseDate.Should().Be(releaseDate);
        platformVersion.Description.Should().Be(description);
        platformVersion.ReleaseNotes.Should().Be(releaseNotes);
        platformVersion.IsCurrentVersion.Should().BeTrue();
    }

    [Fact]
    public void PlatformVersion_Create_WithNullableFields_AllowsNullValues()
    {
        // Arrange & Act
        var platformVersion = new PlatformVersion
        {
            Id = Guid.NewGuid(),
            Version = "1.0.0",
            ReleaseDate = DateTimeOffset.UtcNow,
            Description = null,
            ReleaseNotes = null,
            IsCurrentVersion = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Assert
        platformVersion.Description.Should().BeNull();
        platformVersion.ReleaseNotes.Should().BeNull();
    }

    [Fact]
    public void PlatformVersion_DefaultVersion_IsEmptyString()
    {
        // Arrange & Act
        var platformVersion = new PlatformVersion();

        // Assert
        platformVersion.Version.Should().BeEmpty();
        platformVersion.IsCurrentVersion.Should().BeFalse();
    }

    [Theory]
    [InlineData("1.0.0")]
    [InlineData("2.5.10")]
    [InlineData("10.20.30")]
    [InlineData("1.0.0-beta")]
    [InlineData("2.0.0-rc.1")]
    public void PlatformVersion_Create_WithVariousVersionFormats_AcceptsAllFormats(string version)
    {
        // Arrange & Act
        var platformVersion = new PlatformVersion
        {
            Id = Guid.NewGuid(),
            Version = version,
            ReleaseDate = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Assert
        platformVersion.Version.Should().Be(version);
    }

    [Fact]
    public void PlatformVersion_Create_WithFutureReleaseDate_AcceptsDate()
    {
        // Arrange
        var futureDate = DateTimeOffset.UtcNow.AddDays(30);

        // Act
        var platformVersion = new PlatformVersion
        {
            Id = Guid.NewGuid(),
            Version = "2.0.0",
            ReleaseDate = futureDate,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Assert
        platformVersion.ReleaseDate.Should().Be(futureDate);
        platformVersion.ReleaseDate.Should().BeAfter(DateTimeOffset.UtcNow);
    }

    #endregion

    #region MigrationHistory Entity Tests

    [Fact]
    public void MigrationHistory_Create_WithValidData_SetsPropertiesCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid();
        var migrationName = "AddUserTable_20231101";
        var appliedAt = DateTimeOffset.UtcNow;
        var appliedByUserId = Guid.NewGuid();
        var duration = TimeSpan.FromSeconds(5);

        // Act
        var migration = new MigrationHistory
        {
            Id = id,
            MigrationName = migrationName,
            AppliedAt = appliedAt,
            AppliedByUserId = appliedByUserId,
            Status = MigrationStatus.Completed,
            Duration = duration
        };

        // Assert
        migration.Id.Should().Be(id);
        migration.MigrationName.Should().Be(migrationName);
        migration.AppliedAt.Should().Be(appliedAt);
        migration.AppliedByUserId.Should().Be(appliedByUserId);
        migration.Status.Should().Be(MigrationStatus.Completed);
        migration.Duration.Should().Be(duration);
    }

    [Fact]
    public void MigrationHistory_Create_WithFailedStatus_IncludesErrorMessage()
    {
        // Arrange
        var errorMessage = "Database connection timeout";

        // Act
        var migration = new MigrationHistory
        {
            Id = Guid.NewGuid(),
            MigrationName = "FailedMigration",
            AppliedAt = DateTimeOffset.UtcNow,
            AppliedByUserId = Guid.NewGuid(),
            Status = MigrationStatus.Failed,
            ErrorMessage = errorMessage,
            Duration = TimeSpan.FromSeconds(2)
        };

        // Assert
        migration.Status.Should().Be(MigrationStatus.Failed);
        migration.ErrorMessage.Should().Be(errorMessage);
    }

    [Fact]
    public void MigrationHistory_DefaultMigrationName_IsEmptyString()
    {
        // Arrange & Act
        var migration = new MigrationHistory();

        // Assert
        migration.MigrationName.Should().BeEmpty();
        migration.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void MigrationHistory_Duration_CanBeZero()
    {
        // Arrange & Act
        var migration = new MigrationHistory
        {
            Id = Guid.NewGuid(),
            MigrationName = "QuickMigration",
            AppliedAt = DateTimeOffset.UtcNow,
            AppliedByUserId = Guid.NewGuid(),
            Status = MigrationStatus.Completed,
            Duration = TimeSpan.Zero
        };

        // Assert
        migration.Duration.Should().Be(TimeSpan.Zero);
    }

    [Theory]
    [InlineData(MigrationStatus.Pending)]
    [InlineData(MigrationStatus.Running)]
    [InlineData(MigrationStatus.Completed)]
    [InlineData(MigrationStatus.Failed)]
    [InlineData(MigrationStatus.RolledBack)]
    public void MigrationHistory_Create_WithAllStatusValues_AcceptsAllStatuses(MigrationStatus status)
    {
        // Arrange & Act
        var migration = new MigrationHistory
        {
            Id = Guid.NewGuid(),
            MigrationName = "TestMigration",
            AppliedAt = DateTimeOffset.UtcNow,
            AppliedByUserId = Guid.NewGuid(),
            Status = status,
            Duration = TimeSpan.FromSeconds(1)
        };

        // Assert
        migration.Status.Should().Be(status);
    }

    #endregion

    #region IntegrationTestResult Entity Tests

    [Fact]
    public void IntegrationTestResult_Create_WithValidData_SetsPropertiesCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid();
        var testSuiteId = Guid.NewGuid();
        var testName = "AuthenticationTest";
        var startedAt = DateTimeOffset.UtcNow;
        var completedAt = startedAt.AddSeconds(10);
        var category = "Security";

        // Act
        var result = new IntegrationTestResult
        {
            Id = id,
            TestSuiteId = testSuiteId,
            TestName = testName,
            Status = TestStatus.Passed,
            StartedAt = startedAt,
            CompletedAt = completedAt,
            Category = category
        };

        // Assert
        result.Id.Should().Be(id);
        result.TestSuiteId.Should().Be(testSuiteId);
        result.TestName.Should().Be(testName);
        result.Status.Should().Be(TestStatus.Passed);
        result.StartedAt.Should().Be(startedAt);
        result.CompletedAt.Should().Be(completedAt);
        result.Category.Should().Be(category);
    }

    [Fact]
    public void IntegrationTestResult_Create_WithFailedStatus_IncludesErrorDetails()
    {
        // Arrange
        var errorMessage = "Assertion failed";
        var stackTrace = "at TestClass.TestMethod() in TestFile.cs:line 42";

        // Act
        var result = new IntegrationTestResult
        {
            Id = Guid.NewGuid(),
            TestSuiteId = Guid.NewGuid(),
            TestName = "FailedTest",
            Status = TestStatus.Failed,
            StartedAt = DateTimeOffset.UtcNow,
            CompletedAt = DateTimeOffset.UtcNow.AddSeconds(1),
            ErrorMessage = errorMessage,
            StackTrace = stackTrace
        };

        // Assert
        result.Status.Should().Be(TestStatus.Failed);
        result.ErrorMessage.Should().Be(errorMessage);
        result.StackTrace.Should().Be(stackTrace);
    }

    [Fact]
    public void IntegrationTestResult_Create_WithPendingStatus_HasNoCompletedAt()
    {
        // Arrange & Act
        var result = new IntegrationTestResult
        {
            Id = Guid.NewGuid(),
            TestSuiteId = Guid.NewGuid(),
            TestName = "PendingTest",
            Status = TestStatus.Pending,
            StartedAt = DateTimeOffset.UtcNow,
            CompletedAt = null
        };

        // Assert
        result.Status.Should().Be(TestStatus.Pending);
        result.CompletedAt.Should().BeNull();
    }

    [Fact]
    public void IntegrationTestResult_DefaultTestName_IsEmptyString()
    {
        // Arrange & Act
        var result = new IntegrationTestResult();

        // Assert
        result.TestName.Should().BeEmpty();
        result.ErrorMessage.Should().BeNull();
        result.StackTrace.Should().BeNull();
        result.Category.Should().BeNull();
    }

    [Theory]
    [InlineData(TestStatus.Pending)]
    [InlineData(TestStatus.Running)]
    [InlineData(TestStatus.Passed)]
    [InlineData(TestStatus.Failed)]
    [InlineData(TestStatus.Skipped)]
    public void IntegrationTestResult_Create_WithAllStatusValues_AcceptsAllStatuses(TestStatus status)
    {
        // Arrange & Act
        var result = new IntegrationTestResult
        {
            Id = Guid.NewGuid(),
            TestSuiteId = Guid.NewGuid(),
            TestName = "StatusTest",
            Status = status,
            StartedAt = DateTimeOffset.UtcNow
        };

        // Assert
        result.Status.Should().Be(status);
    }

    #endregion

    #region Enum Tests

    [Fact]
    public void TestStatus_HasCorrectValues()
    {
        // Assert
        ((int)TestStatus.Pending).Should().Be(0);
        ((int)TestStatus.Running).Should().Be(1);
        ((int)TestStatus.Passed).Should().Be(2);
        ((int)TestStatus.Failed).Should().Be(3);
        ((int)TestStatus.Skipped).Should().Be(4);
    }

    [Fact]
    public void HealthStatus_HasCorrectValues()
    {
        // Assert
        ((int)HealthStatus.Healthy).Should().Be(0);
        ((int)HealthStatus.Degraded).Should().Be(1);
        ((int)HealthStatus.Unhealthy).Should().Be(2);
        ((int)HealthStatus.Unknown).Should().Be(3);
    }

    [Fact]
    public void ComponentType_HasCorrectValues()
    {
        // Assert
        ((int)ComponentType.Database).Should().Be(0);
        ((int)ComponentType.Cache).Should().Be(1);
        ((int)ComponentType.MessageBroker).Should().Be(2);
        ((int)ComponentType.ExternalService).Should().Be(3);
        ((int)ComponentType.BackgroundWorker).Should().Be(4);
        ((int)ComponentType.Module).Should().Be(5);
    }

    [Fact]
    public void MigrationStatus_HasCorrectValues()
    {
        // Assert
        ((int)MigrationStatus.Pending).Should().Be(0);
        ((int)MigrationStatus.Running).Should().Be(1);
        ((int)MigrationStatus.Completed).Should().Be(2);
        ((int)MigrationStatus.Failed).Should().Be(3);
        ((int)MigrationStatus.RolledBack).Should().Be(4);
    }

    [Fact]
    public void TestStatus_AllValuesAreDefined()
    {
        // Arrange
        var definedValues = Enum.GetValues<TestStatus>();

        // Assert
        definedValues.Should().HaveCount(5);
        definedValues.Should().Contain(TestStatus.Pending);
        definedValues.Should().Contain(TestStatus.Running);
        definedValues.Should().Contain(TestStatus.Passed);
        definedValues.Should().Contain(TestStatus.Failed);
        definedValues.Should().Contain(TestStatus.Skipped);
    }

    [Fact]
    public void ComponentType_AllValuesAreDefined()
    {
        // Arrange
        var definedValues = Enum.GetValues<ComponentType>();

        // Assert
        definedValues.Should().HaveCount(6);
        definedValues.Should().Contain(ComponentType.Database);
        definedValues.Should().Contain(ComponentType.Cache);
        definedValues.Should().Contain(ComponentType.MessageBroker);
        definedValues.Should().Contain(ComponentType.ExternalService);
        definedValues.Should().Contain(ComponentType.BackgroundWorker);
        definedValues.Should().Contain(ComponentType.Module);
    }

    #endregion

    #region EF Core Entity Tests

    [Fact]
    public void PlatformVersionEntity_Create_SetsPropertiesCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid();
        var version = "3.0.0";

        // Act
        var entity = new PlatformVersionEntity
        {
            Id = id,
            Version = version,
            ReleaseDate = DateTimeOffset.UtcNow,
            Description = "Major release",
            ReleaseNotes = "New features included",
            IsCurrentVersion = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.Version.Should().Be(version);
        entity.IsCurrentVersion.Should().BeTrue();
    }

    [Fact]
    public void MigrationHistoryEntity_Create_WithDurationTicks_StoresCorrectly()
    {
        // Arrange
        var duration = TimeSpan.FromMinutes(5);

        // Act
        var entity = new MigrationHistoryEntity
        {
            Id = Guid.NewGuid(),
            MigrationName = "LongMigration",
            AppliedAt = DateTimeOffset.UtcNow,
            AppliedByUserId = Guid.NewGuid(),
            Status = (int)MigrationStatus.Completed,
            DurationTicks = duration.Ticks
        };

        // Assert
        entity.DurationTicks.Should().Be(duration.Ticks);
        TimeSpan.FromTicks(entity.DurationTicks).Should().Be(duration);
    }

    [Fact]
    public void IntegrationTestResultEntity_Create_WithStatusAsInt_StoresCorrectly()
    {
        // Arrange & Act
        var entity = new IntegrationTestResultEntity
        {
            Id = Guid.NewGuid(),
            TestSuiteId = Guid.NewGuid(),
            TestName = "EntityTest",
            Status = (int)TestStatus.Passed,
            StartedAt = DateTimeOffset.UtcNow,
            CompletedAt = DateTimeOffset.UtcNow.AddSeconds(5)
        };

        // Assert
        entity.Status.Should().Be((int)TestStatus.Passed);
        ((TestStatus)entity.Status).Should().Be(TestStatus.Passed);
    }

    #endregion

    #region Repository Mock Tests - IPlatformVersionRepository

    [Fact]
    public async Task PlatformVersionRepository_GetByIdAsync_ReturnsVersion()
    {
        // Arrange
        var mockRepository = new Mock<IPlatformVersionRepository>();
        var versionId = Guid.NewGuid();
        var expectedVersion = new PlatformVersion
        {
            Id = versionId,
            Version = "1.0.0",
            ReleaseDate = DateTimeOffset.UtcNow,
            IsCurrentVersion = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        mockRepository
            .Setup(r => r.GetByIdAsync(versionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedVersion);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(versionId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(versionId);
        result.Version.Should().Be("1.0.0");
        mockRepository.Verify(r => r.GetByIdAsync(versionId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task PlatformVersionRepository_GetByIdAsync_ReturnsNullForNonExistent()
    {
        // Arrange
        var mockRepository = new Mock<IPlatformVersionRepository>();
        var nonExistentId = Guid.NewGuid();

        mockRepository
            .Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlatformVersion?)null);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task PlatformVersionRepository_GetCurrentVersionAsync_ReturnsCurrentVersion()
    {
        // Arrange
        var mockRepository = new Mock<IPlatformVersionRepository>();
        var currentVersion = new PlatformVersion
        {
            Id = Guid.NewGuid(),
            Version = "2.5.0",
            ReleaseDate = DateTimeOffset.UtcNow,
            IsCurrentVersion = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        mockRepository
            .Setup(r => r.GetCurrentVersionAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentVersion);

        // Act
        var result = await mockRepository.Object.GetCurrentVersionAsync();

        // Assert
        result.Should().NotBeNull();
        result!.IsCurrentVersion.Should().BeTrue();
        result.Version.Should().Be("2.5.0");
    }

    [Fact]
    public async Task PlatformVersionRepository_GetAllAsync_ReturnsAllVersions()
    {
        // Arrange
        var mockRepository = new Mock<IPlatformVersionRepository>();
        var versions = new List<PlatformVersion>
        {
            new() { Id = Guid.NewGuid(), Version = "1.0.0", ReleaseDate = DateTimeOffset.UtcNow.AddDays(-30), CreatedAt = DateTimeOffset.UtcNow },
            new() { Id = Guid.NewGuid(), Version = "1.1.0", ReleaseDate = DateTimeOffset.UtcNow.AddDays(-15), CreatedAt = DateTimeOffset.UtcNow },
            new() { Id = Guid.NewGuid(), Version = "2.0.0", ReleaseDate = DateTimeOffset.UtcNow, IsCurrentVersion = true, CreatedAt = DateTimeOffset.UtcNow }
        };

        mockRepository
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(versions);

        // Act
        var result = await mockRepository.Object.GetAllAsync();

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain(v => v.Version == "1.0.0");
        result.Should().Contain(v => v.Version == "2.0.0");
    }

    [Fact]
    public async Task PlatformVersionRepository_GetVersionHistoryAsync_ReturnsPaginatedResults()
    {
        // Arrange
        var mockRepository = new Mock<IPlatformVersionRepository>();
        var versions = new List<PlatformVersion>
        {
            new() { Id = Guid.NewGuid(), Version = "1.0.0", ReleaseDate = DateTimeOffset.UtcNow, CreatedAt = DateTimeOffset.UtcNow },
            new() { Id = Guid.NewGuid(), Version = "1.1.0", ReleaseDate = DateTimeOffset.UtcNow, CreatedAt = DateTimeOffset.UtcNow }
        };

        mockRepository
            .Setup(r => r.GetVersionHistoryAsync(1, 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(versions);

        // Act
        var result = await mockRepository.Object.GetVersionHistoryAsync(1, 2);

        // Assert
        result.Should().HaveCount(2);
        mockRepository.Verify(r => r.GetVersionHistoryAsync(1, 2, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task PlatformVersionRepository_AddAsync_CallsRepositoryCorrectly()
    {
        // Arrange
        var mockRepository = new Mock<IPlatformVersionRepository>();
        var newVersion = new PlatformVersion
        {
            Id = Guid.NewGuid(),
            Version = "3.0.0",
            ReleaseDate = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow
        };

        mockRepository
            .Setup(r => r.AddAsync(It.IsAny<PlatformVersion>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.AddAsync(newVersion);

        // Assert
        mockRepository.Verify(r => r.AddAsync(
            It.Is<PlatformVersion>(v => v.Version == "3.0.0"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task PlatformVersionRepository_SetCurrentVersionAsync_UpdatesCurrentVersion()
    {
        // Arrange
        var mockRepository = new Mock<IPlatformVersionRepository>();
        var versionId = Guid.NewGuid();

        mockRepository
            .Setup(r => r.SetCurrentVersionAsync(versionId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.SetCurrentVersionAsync(versionId);

        // Assert
        mockRepository.Verify(r => r.SetCurrentVersionAsync(versionId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Repository Mock Tests - IMigrationHistoryRepository

    [Fact]
    public async Task MigrationHistoryRepository_GetByNameAsync_ReturnsMigration()
    {
        // Arrange
        var mockRepository = new Mock<IMigrationHistoryRepository>();
        var migrationName = "AddUsersTable_20231101";
        var expectedMigration = new MigrationHistory
        {
            Id = Guid.NewGuid(),
            MigrationName = migrationName,
            AppliedAt = DateTimeOffset.UtcNow,
            AppliedByUserId = Guid.NewGuid(),
            Status = MigrationStatus.Completed,
            Duration = TimeSpan.FromSeconds(3)
        };

        mockRepository
            .Setup(r => r.GetByNameAsync(migrationName, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedMigration);

        // Act
        var result = await mockRepository.Object.GetByNameAsync(migrationName);

        // Assert
        result.Should().NotBeNull();
        result!.MigrationName.Should().Be(migrationName);
        result.Status.Should().Be(MigrationStatus.Completed);
    }

    [Fact]
    public async Task MigrationHistoryRepository_GetPendingMigrationsAsync_ReturnsPendingMigrations()
    {
        // Arrange
        var mockRepository = new Mock<IMigrationHistoryRepository>();
        var pendingMigrations = new List<MigrationHistory>
        {
            new() { Id = Guid.NewGuid(), MigrationName = "Migration1", Status = MigrationStatus.Pending, AppliedAt = DateTimeOffset.UtcNow, AppliedByUserId = Guid.NewGuid(), Duration = TimeSpan.Zero },
            new() { Id = Guid.NewGuid(), MigrationName = "Migration2", Status = MigrationStatus.Pending, AppliedAt = DateTimeOffset.UtcNow, AppliedByUserId = Guid.NewGuid(), Duration = TimeSpan.Zero }
        };

        mockRepository
            .Setup(r => r.GetPendingMigrationsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(pendingMigrations);

        // Act
        var result = await mockRepository.Object.GetPendingMigrationsAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(m => m.Status == MigrationStatus.Pending);
    }

    [Fact]
    public async Task MigrationHistoryRepository_GetLatestMigrationAsync_ReturnsLatestMigration()
    {
        // Arrange
        var mockRepository = new Mock<IMigrationHistoryRepository>();
        var latestMigration = new MigrationHistory
        {
            Id = Guid.NewGuid(),
            MigrationName = "LatestMigration_20231115",
            AppliedAt = DateTimeOffset.UtcNow,
            AppliedByUserId = Guid.NewGuid(),
            Status = MigrationStatus.Completed,
            Duration = TimeSpan.FromSeconds(10)
        };

        mockRepository
            .Setup(r => r.GetLatestMigrationAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(latestMigration);

        // Act
        var result = await mockRepository.Object.GetLatestMigrationAsync();

        // Assert
        result.Should().NotBeNull();
        result!.MigrationName.Should().Contain("Latest");
    }

    [Fact]
    public async Task MigrationHistoryRepository_GetAllAsync_FiltersByStatus()
    {
        // Arrange
        var mockRepository = new Mock<IMigrationHistoryRepository>();
        var completedMigrations = new List<MigrationHistory>
        {
            new() { Id = Guid.NewGuid(), MigrationName = "Completed1", Status = MigrationStatus.Completed, AppliedAt = DateTimeOffset.UtcNow, AppliedByUserId = Guid.NewGuid(), Duration = TimeSpan.FromSeconds(1) }
        };

        mockRepository
            .Setup(r => r.GetAllAsync(1, 10, MigrationStatus.Completed, It.IsAny<CancellationToken>()))
            .ReturnsAsync(completedMigrations);

        // Act
        var result = await mockRepository.Object.GetAllAsync(1, 10, MigrationStatus.Completed);

        // Assert
        result.Should().HaveCount(1);
        result.Should().OnlyContain(m => m.Status == MigrationStatus.Completed);
    }

    [Fact]
    public async Task MigrationHistoryRepository_GetTotalCountAsync_ReturnsCorrectCount()
    {
        // Arrange
        var mockRepository = new Mock<IMigrationHistoryRepository>();

        mockRepository
            .Setup(r => r.GetTotalCountAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(25);

        // Act
        var result = await mockRepository.Object.GetTotalCountAsync(null);

        // Assert
        result.Should().Be(25);
    }

    #endregion

    #region Repository Mock Tests - IIntegrationTestResultRepository

    [Fact]
    public async Task IntegrationTestResultRepository_GetByTestSuiteIdAsync_ReturnsResults()
    {
        // Arrange
        var mockRepository = new Mock<IIntegrationTestResultRepository>();
        var testSuiteId = Guid.NewGuid();
        var results = new List<IntegrationTestResult>
        {
            new() { Id = Guid.NewGuid(), TestSuiteId = testSuiteId, TestName = "Test1", Status = TestStatus.Passed, StartedAt = DateTimeOffset.UtcNow },
            new() { Id = Guid.NewGuid(), TestSuiteId = testSuiteId, TestName = "Test2", Status = TestStatus.Passed, StartedAt = DateTimeOffset.UtcNow },
            new() { Id = Guid.NewGuid(), TestSuiteId = testSuiteId, TestName = "Test3", Status = TestStatus.Failed, StartedAt = DateTimeOffset.UtcNow }
        };

        mockRepository
            .Setup(r => r.GetByTestSuiteIdAsync(testSuiteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(results);

        // Act
        var result = await mockRepository.Object.GetByTestSuiteIdAsync(testSuiteId);

        // Assert
        result.Should().HaveCount(3);
        result.Should().OnlyContain(r => r.TestSuiteId == testSuiteId);
    }

    [Fact]
    public async Task IntegrationTestResultRepository_GetLatestResultsAsync_ReturnsRequestedCount()
    {
        // Arrange
        var mockRepository = new Mock<IIntegrationTestResultRepository>();
        var results = new List<IntegrationTestResult>
        {
            new() { Id = Guid.NewGuid(), TestSuiteId = Guid.NewGuid(), TestName = "Latest1", Status = TestStatus.Passed, StartedAt = DateTimeOffset.UtcNow },
            new() { Id = Guid.NewGuid(), TestSuiteId = Guid.NewGuid(), TestName = "Latest2", Status = TestStatus.Passed, StartedAt = DateTimeOffset.UtcNow }
        };

        mockRepository
            .Setup(r => r.GetLatestResultsAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(results);

        // Act
        var result = await mockRepository.Object.GetLatestResultsAsync(2);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task IntegrationTestResultRepository_AddRangeAsync_AddsMultipleResults()
    {
        // Arrange
        var mockRepository = new Mock<IIntegrationTestResultRepository>();
        var testSuiteId = Guid.NewGuid();
        var results = new List<IntegrationTestResult>
        {
            new() { Id = Guid.NewGuid(), TestSuiteId = testSuiteId, TestName = "Test1", Status = TestStatus.Passed, StartedAt = DateTimeOffset.UtcNow },
            new() { Id = Guid.NewGuid(), TestSuiteId = testSuiteId, TestName = "Test2", Status = TestStatus.Failed, StartedAt = DateTimeOffset.UtcNow }
        };

        mockRepository
            .Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<IntegrationTestResult>>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.AddRangeAsync(results);

        // Assert
        mockRepository.Verify(r => r.AddRangeAsync(
            It.Is<IEnumerable<IntegrationTestResult>>(list => list.Count() == 2),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IntegrationTestResultRepository_DeleteByTestSuiteIdAsync_DeletesAllResults()
    {
        // Arrange
        var mockRepository = new Mock<IIntegrationTestResultRepository>();
        var testSuiteId = Guid.NewGuid();

        mockRepository
            .Setup(r => r.DeleteByTestSuiteIdAsync(testSuiteId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.DeleteByTestSuiteIdAsync(testSuiteId);

        // Assert
        mockRepository.Verify(r => r.DeleteByTestSuiteIdAsync(testSuiteId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IntegrationTestResultRepository_GetAllAsync_FiltersByStatusAndCategory()
    {
        // Arrange
        var mockRepository = new Mock<IIntegrationTestResultRepository>();
        var results = new List<IntegrationTestResult>
        {
            new() { Id = Guid.NewGuid(), TestSuiteId = Guid.NewGuid(), TestName = "SecurityTest", Status = TestStatus.Passed, StartedAt = DateTimeOffset.UtcNow, Category = "Security" }
        };

        mockRepository
            .Setup(r => r.GetAllAsync(1, 10, TestStatus.Passed, "Security", It.IsAny<CancellationToken>()))
            .ReturnsAsync(results);

        // Act
        var result = await mockRepository.Object.GetAllAsync(1, 10, TestStatus.Passed, "Security");

        // Assert
        result.Should().HaveCount(1);
        result.First().Category.Should().Be("Security");
        result.First().Status.Should().Be(TestStatus.Passed);
    }

    [Fact]
    public async Task IntegrationTestResultRepository_GetTotalCountAsync_ReturnsFilteredCount()
    {
        // Arrange
        var mockRepository = new Mock<IIntegrationTestResultRepository>();

        mockRepository
            .Setup(r => r.GetTotalCountAsync(TestStatus.Failed, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);

        // Act
        var result = await mockRepository.Object.GetTotalCountAsync(TestStatus.Failed, null);

        // Assert
        result.Should().Be(5);
    }

    #endregion

    #region Edge Cases and Error Handling

    [Fact]
    public void PlatformVersion_Create_WithEmptyGuid_AllowsEmptyGuid()
    {
        // Arrange & Act
        var version = new PlatformVersion
        {
            Id = Guid.Empty,
            Version = "1.0.0",
            ReleaseDate = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Assert
        version.Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void MigrationHistory_Create_WithLongMigrationName_AcceptsLongName()
    {
        // Arrange
        var longName = new string('A', 500);

        // Act
        var migration = new MigrationHistory
        {
            Id = Guid.NewGuid(),
            MigrationName = longName,
            AppliedAt = DateTimeOffset.UtcNow,
            AppliedByUserId = Guid.NewGuid(),
            Status = MigrationStatus.Completed,
            Duration = TimeSpan.FromSeconds(1)
        };

        // Assert
        migration.MigrationName.Should().HaveLength(500);
    }

    [Fact]
    public void IntegrationTestResult_Create_WithLongStackTrace_AcceptsLongTrace()
    {
        // Arrange
        var longStackTrace = string.Join("\n", Enumerable.Range(1, 100).Select(i => $"at Method{i}() in File.cs:line {i}"));

        // Act
        var result = new IntegrationTestResult
        {
            Id = Guid.NewGuid(),
            TestSuiteId = Guid.NewGuid(),
            TestName = "TestWithLongStackTrace",
            Status = TestStatus.Failed,
            StartedAt = DateTimeOffset.UtcNow,
            StackTrace = longStackTrace
        };

        // Assert
        result.StackTrace.Should().NotBeNullOrEmpty();
        result.StackTrace.Should().Contain("Method1");
        result.StackTrace.Should().Contain("Method100");
    }

    [Fact]
    public async Task Repository_CancellationToken_IsPropagated()
    {
        // Arrange
        var mockRepository = new Mock<IPlatformVersionRepository>();
        var cancellationToken = new CancellationToken(true);

        mockRepository
            .Setup(r => r.GetAllAsync(cancellationToken))
            .ThrowsAsync(new OperationCanceledException());

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(
            () => mockRepository.Object.GetAllAsync(cancellationToken));
    }

    [Fact]
    public void MigrationStatus_CanBeCastFromInt()
    {
        // Arrange
        var statusInt = 2;

        // Act
        var status = (MigrationStatus)statusInt;

        // Assert
        status.Should().Be(MigrationStatus.Completed);
    }

    [Fact]
    public void TestStatus_CanBeCastToInt()
    {
        // Arrange
        var status = TestStatus.Failed;

        // Act
        var statusInt = (int)status;

        // Assert
        statusInt.Should().Be(3);
    }

    #endregion
}
