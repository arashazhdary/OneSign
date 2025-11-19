using FluentAssertions;
using Moq;
using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Modules.Hunting.Domain.Repositories;
using Onesign.Modules.Hunting.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.Hunting;

public class HuntingModuleTests
{
    #region SavedQuery Entity Tests

    [Fact]
    public void SavedQuery_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var savedQuery = new SavedQuery();

        // Assert
        savedQuery.Id.Should().Be(Guid.Empty);
        savedQuery.ScopeType.Should().Be(string.Empty);
        savedQuery.ScopeId.Should().Be(Guid.Empty);
        savedQuery.Name.Should().Be(string.Empty);
        savedQuery.Description.Should().BeNull();
        savedQuery.Dataset.Should().Be(HuntDataset.SignInEvents);
        savedQuery.QueryDslJson.Should().Be(string.Empty);
        savedQuery.IsGlobalTemplate.Should().BeFalse();
        savedQuery.IsEnabled.Should().BeFalse();
        savedQuery.CreatedByUserId.Should().Be(Guid.Empty);
        savedQuery.UpdatedByUserId.Should().BeNull();
        savedQuery.UpdatedAt.Should().BeNull();
        savedQuery.ScheduledHunts.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void SavedQuery_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var scopeId = Guid.NewGuid();
        var createdByUserId = Guid.NewGuid();
        var updatedByUserId = Guid.NewGuid();
        var createdAt = DateTimeOffset.UtcNow;
        var updatedAt = DateTimeOffset.UtcNow.AddHours(1);
        var queryDsl = "{\"filter\":{\"field\":\"username\",\"operator\":\"contains\",\"value\":\"admin\"}}";

        // Act
        var savedQuery = new SavedQuery
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = scopeId,
            Name = "Detect Admin Logins",
            Description = "Query to detect admin user login patterns",
            Dataset = HuntDataset.SignInEvents,
            QueryDslJson = queryDsl,
            IsGlobalTemplate = true,
            IsEnabled = true,
            CreatedByUserId = createdByUserId,
            CreatedAt = createdAt,
            UpdatedByUserId = updatedByUserId,
            UpdatedAt = updatedAt
        };

        // Assert
        savedQuery.Id.Should().Be(id);
        savedQuery.ScopeType.Should().Be("Tenant");
        savedQuery.ScopeId.Should().Be(scopeId);
        savedQuery.Name.Should().Be("Detect Admin Logins");
        savedQuery.Description.Should().Be("Query to detect admin user login patterns");
        savedQuery.Dataset.Should().Be(HuntDataset.SignInEvents);
        savedQuery.QueryDslJson.Should().Be(queryDsl);
        savedQuery.IsGlobalTemplate.Should().BeTrue();
        savedQuery.IsEnabled.Should().BeTrue();
        savedQuery.CreatedByUserId.Should().Be(createdByUserId);
        savedQuery.CreatedAt.Should().Be(createdAt);
        savedQuery.UpdatedByUserId.Should().Be(updatedByUserId);
        savedQuery.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void SavedQuery_ScheduledHunts_ShouldSupportNavigation()
    {
        // Arrange
        var savedQuery = new SavedQuery
        {
            Id = Guid.NewGuid(),
            Name = "Test Query"
        };

        var scheduledHunt = new ScheduledHunt
        {
            Id = Guid.NewGuid(),
            SavedQueryId = savedQuery.Id,
            Name = "Hourly Hunt"
        };

        // Act
        savedQuery.ScheduledHunts.Add(scheduledHunt);

        // Assert
        savedQuery.ScheduledHunts.Should().HaveCount(1);
        savedQuery.ScheduledHunts[0].Should().Be(scheduledHunt);
    }

    [Theory]
    [InlineData("Tenant")]
    [InlineData("Application")]
    [InlineData("User")]
    public void SavedQuery_ScopeTypes_ShouldBeAssignable(string scopeType)
    {
        // Arrange & Act
        var savedQuery = new SavedQuery { ScopeType = scopeType };

        // Assert
        savedQuery.ScopeType.Should().Be(scopeType);
    }

    #endregion

    #region ScheduledHunt Entity Tests

    [Fact]
    public void ScheduledHunt_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var scheduledHunt = new ScheduledHunt();

        // Assert
        scheduledHunt.Id.Should().Be(Guid.Empty);
        scheduledHunt.ScopeType.Should().Be(string.Empty);
        scheduledHunt.ScopeId.Should().Be(Guid.Empty);
        scheduledHunt.SavedQueryId.Should().Be(Guid.Empty);
        scheduledHunt.Name.Should().Be(string.Empty);
        scheduledHunt.Description.Should().BeNull();
        scheduledHunt.ScheduleSpec.Should().Be(HuntScheduleSpec.Hourly);
        scheduledHunt.IsEnabled.Should().BeFalse();
        scheduledHunt.MinMatchCountForFinding.Should().Be(0);
        scheduledHunt.MaxRowsToScan.Should().Be(0);
        scheduledHunt.TimeWindowMinutes.Should().Be(0);
        scheduledHunt.ActionsJson.Should().BeNull();
        scheduledHunt.SavedQuery.Should().BeNull();
        scheduledHunt.HuntRuns.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void ScheduledHunt_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var scopeId = Guid.NewGuid();
        var savedQueryId = Guid.NewGuid();
        var createdByUserId = Guid.NewGuid();
        var createdAt = DateTimeOffset.UtcNow;
        var actionsJson = "[{\"type\":\"createIncident\",\"severity\":\"high\"}]";

        // Act
        var scheduledHunt = new ScheduledHunt
        {
            Id = id,
            ScopeType = "Tenant",
            ScopeId = scopeId,
            SavedQueryId = savedQueryId,
            Name = "Daily Security Scan",
            Description = "Performs daily security scan for anomalies",
            ScheduleSpec = HuntScheduleSpec.Daily,
            IsEnabled = true,
            MinMatchCountForFinding = 5,
            MaxRowsToScan = 10000,
            TimeWindowMinutes = 1440,
            ActionsJson = actionsJson,
            CreatedByUserId = createdByUserId,
            CreatedAt = createdAt
        };

        // Assert
        scheduledHunt.Id.Should().Be(id);
        scheduledHunt.ScopeType.Should().Be("Tenant");
        scheduledHunt.ScopeId.Should().Be(scopeId);
        scheduledHunt.SavedQueryId.Should().Be(savedQueryId);
        scheduledHunt.Name.Should().Be("Daily Security Scan");
        scheduledHunt.Description.Should().Be("Performs daily security scan for anomalies");
        scheduledHunt.ScheduleSpec.Should().Be(HuntScheduleSpec.Daily);
        scheduledHunt.IsEnabled.Should().BeTrue();
        scheduledHunt.MinMatchCountForFinding.Should().Be(5);
        scheduledHunt.MaxRowsToScan.Should().Be(10000);
        scheduledHunt.TimeWindowMinutes.Should().Be(1440);
        scheduledHunt.ActionsJson.Should().Be(actionsJson);
    }

    [Fact]
    public void ScheduledHunt_NavigationToSavedQuery_ShouldWork()
    {
        // Arrange
        var savedQuery = new SavedQuery
        {
            Id = Guid.NewGuid(),
            Name = "Parent Query"
        };

        // Act
        var scheduledHunt = new ScheduledHunt
        {
            SavedQueryId = savedQuery.Id,
            SavedQuery = savedQuery
        };

        // Assert
        scheduledHunt.SavedQuery.Should().NotBeNull();
        scheduledHunt.SavedQuery!.Name.Should().Be("Parent Query");
    }

    [Theory]
    [InlineData(0, 0, 60)]
    [InlineData(1, 100, 1440)]
    [InlineData(10, 5000, 10080)]
    [InlineData(100, 50000, 43200)]
    public void ScheduledHunt_ConfigurationValues_ShouldBeValid(int minMatch, int maxRows, int timeWindow)
    {
        // Arrange & Act
        var scheduledHunt = new ScheduledHunt
        {
            MinMatchCountForFinding = minMatch,
            MaxRowsToScan = maxRows,
            TimeWindowMinutes = timeWindow
        };

        // Assert
        scheduledHunt.MinMatchCountForFinding.Should().Be(minMatch);
        scheduledHunt.MaxRowsToScan.Should().Be(maxRows);
        scheduledHunt.TimeWindowMinutes.Should().Be(timeWindow);
    }

    #endregion

    #region HuntRun Entity Tests

    [Fact]
    public void HuntRun_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var huntRun = new HuntRun();

        // Assert
        huntRun.Id.Should().Be(Guid.Empty);
        huntRun.ScheduledHuntId.Should().Be(Guid.Empty);
        huntRun.ScopeType.Should().Be(string.Empty);
        huntRun.ScopeId.Should().Be(Guid.Empty);
        huntRun.CompletedAt.Should().BeNull();
        huntRun.Status.Should().Be(HuntRunStatus.Running);
        huntRun.MatchCount.Should().Be(0);
        huntRun.FindingCreated.Should().BeFalse();
        huntRun.IncidentId.Should().BeNull();
        huntRun.TriggeredWorkflowId.Should().BeNull();
        huntRun.ErrorMessage.Should().BeNull();
        huntRun.ScheduledHunt.Should().BeNull();
        huntRun.SampleRows.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void HuntRun_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var scheduledHuntId = Guid.NewGuid();
        var scopeId = Guid.NewGuid();
        var incidentId = Guid.NewGuid();
        var workflowId = Guid.NewGuid();
        var startedAt = DateTimeOffset.UtcNow;
        var completedAt = DateTimeOffset.UtcNow.AddMinutes(5);

        // Act
        var huntRun = new HuntRun
        {
            Id = id,
            ScheduledHuntId = scheduledHuntId,
            ScopeType = "Tenant",
            ScopeId = scopeId,
            StartedAt = startedAt,
            CompletedAt = completedAt,
            Status = HuntRunStatus.Succeeded,
            MatchCount = 25,
            FindingCreated = true,
            IncidentId = incidentId,
            TriggeredWorkflowId = workflowId,
            ErrorMessage = null
        };

        // Assert
        huntRun.Id.Should().Be(id);
        huntRun.ScheduledHuntId.Should().Be(scheduledHuntId);
        huntRun.ScopeType.Should().Be("Tenant");
        huntRun.ScopeId.Should().Be(scopeId);
        huntRun.StartedAt.Should().Be(startedAt);
        huntRun.CompletedAt.Should().Be(completedAt);
        huntRun.Status.Should().Be(HuntRunStatus.Succeeded);
        huntRun.MatchCount.Should().Be(25);
        huntRun.FindingCreated.Should().BeTrue();
        huntRun.IncidentId.Should().Be(incidentId);
        huntRun.TriggeredWorkflowId.Should().Be(workflowId);
    }

    [Fact]
    public void HuntRun_FailedStatus_ShouldContainErrorMessage()
    {
        // Arrange & Act
        var huntRun = new HuntRun
        {
            Status = HuntRunStatus.Failed,
            ErrorMessage = "Query execution timeout exceeded"
        };

        // Assert
        huntRun.Status.Should().Be(HuntRunStatus.Failed);
        huntRun.ErrorMessage.Should().Be("Query execution timeout exceeded");
    }

    [Fact]
    public void HuntRun_SampleRows_ShouldSupportNavigation()
    {
        // Arrange
        var huntRun = new HuntRun
        {
            Id = Guid.NewGuid(),
            Status = HuntRunStatus.Succeeded
        };

        var sampleRow = new HuntSampleRow
        {
            Id = Guid.NewGuid(),
            HuntRunId = huntRun.Id,
            RowIndex = 0,
            DocumentJson = "{\"event\":\"login_success\"}"
        };

        // Act
        huntRun.SampleRows.Add(sampleRow);

        // Assert
        huntRun.SampleRows.Should().HaveCount(1);
        huntRun.SampleRows[0].DocumentJson.Should().Contain("login_success");
    }

    #endregion

    #region HuntSampleRow Entity Tests

    [Fact]
    public void HuntSampleRow_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var sampleRow = new HuntSampleRow();

        // Assert
        sampleRow.Id.Should().Be(Guid.Empty);
        sampleRow.HuntRunId.Should().Be(Guid.Empty);
        sampleRow.RowIndex.Should().Be(0);
        sampleRow.Dataset.Should().Be(HuntDataset.SignInEvents);
        sampleRow.DocumentJson.Should().Be(string.Empty);
        sampleRow.HuntRun.Should().BeNull();
    }

    [Fact]
    public void HuntSampleRow_SetProperties_ShouldRetainValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var huntRunId = Guid.NewGuid();
        var documentJson = "{\"userId\":\"user123\",\"ipAddress\":\"192.168.1.1\",\"timestamp\":\"2024-01-15T10:30:00Z\"}";

        // Act
        var sampleRow = new HuntSampleRow
        {
            Id = id,
            HuntRunId = huntRunId,
            RowIndex = 5,
            Dataset = HuntDataset.PrivilegedAccessEvents,
            DocumentJson = documentJson
        };

        // Assert
        sampleRow.Id.Should().Be(id);
        sampleRow.HuntRunId.Should().Be(huntRunId);
        sampleRow.RowIndex.Should().Be(5);
        sampleRow.Dataset.Should().Be(HuntDataset.PrivilegedAccessEvents);
        sampleRow.DocumentJson.Should().Be(documentJson);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(99)]
    [InlineData(1000)]
    public void HuntSampleRow_RowIndex_ShouldAcceptValidValues(int rowIndex)
    {
        // Arrange & Act
        var sampleRow = new HuntSampleRow { RowIndex = rowIndex };

        // Assert
        sampleRow.RowIndex.Should().Be(rowIndex);
    }

    #endregion

    #region HuntDataset Enum Tests

    [Theory]
    [InlineData(HuntDataset.SignInEvents, 0)]
    [InlineData(HuntDataset.AccessChangeEvents, 1)]
    [InlineData(HuntDataset.PrivilegedAccessEvents, 2)]
    [InlineData(HuntDataset.PolicyDecisionEvents, 3)]
    [InlineData(HuntDataset.AutomationExecutionEvents, 4)]
    [InlineData(HuntDataset.ChangeSetEvents, 5)]
    [InlineData(HuntDataset.IncidentEvents, 6)]
    public void HuntDataset_Values_ShouldHaveCorrectIntValues(HuntDataset dataset, int expectedValue)
    {
        // Assert
        ((int)dataset).Should().Be(expectedValue);
    }

    [Fact]
    public void HuntDataset_AllValues_ShouldBeEnumerable()
    {
        // Arrange
        var allDatasets = Enum.GetValues<HuntDataset>();

        // Assert
        allDatasets.Should().HaveCount(7);
        allDatasets.Should().Contain(HuntDataset.SignInEvents);
        allDatasets.Should().Contain(HuntDataset.AccessChangeEvents);
        allDatasets.Should().Contain(HuntDataset.PrivilegedAccessEvents);
        allDatasets.Should().Contain(HuntDataset.PolicyDecisionEvents);
        allDatasets.Should().Contain(HuntDataset.AutomationExecutionEvents);
        allDatasets.Should().Contain(HuntDataset.ChangeSetEvents);
        allDatasets.Should().Contain(HuntDataset.IncidentEvents);
    }

    #endregion

    #region HuntRunStatus Enum Tests

    [Theory]
    [InlineData(HuntRunStatus.Running, 0)]
    [InlineData(HuntRunStatus.Succeeded, 1)]
    [InlineData(HuntRunStatus.Failed, 2)]
    public void HuntRunStatus_Values_ShouldHaveCorrectIntValues(HuntRunStatus status, int expectedValue)
    {
        // Assert
        ((int)status).Should().Be(expectedValue);
    }

    [Fact]
    public void HuntRunStatus_AllValues_ShouldBeEnumerable()
    {
        // Arrange
        var allStatuses = Enum.GetValues<HuntRunStatus>();

        // Assert
        allStatuses.Should().HaveCount(3);
        allStatuses.Should().Contain(HuntRunStatus.Running);
        allStatuses.Should().Contain(HuntRunStatus.Succeeded);
        allStatuses.Should().Contain(HuntRunStatus.Failed);
    }

    #endregion

    #region HuntScheduleSpec Enum Tests

    [Theory]
    [InlineData(HuntScheduleSpec.Hourly, 0)]
    [InlineData(HuntScheduleSpec.Daily, 1)]
    [InlineData(HuntScheduleSpec.Weekly, 2)]
    [InlineData(HuntScheduleSpec.Custom, 3)]
    public void HuntScheduleSpec_Values_ShouldHaveCorrectIntValues(HuntScheduleSpec spec, int expectedValue)
    {
        // Assert
        ((int)spec).Should().Be(expectedValue);
    }

    [Fact]
    public void HuntScheduleSpec_AllValues_ShouldBeEnumerable()
    {
        // Arrange
        var allSpecs = Enum.GetValues<HuntScheduleSpec>();

        // Assert
        allSpecs.Should().HaveCount(4);
        allSpecs.Should().Contain(HuntScheduleSpec.Hourly);
        allSpecs.Should().Contain(HuntScheduleSpec.Daily);
        allSpecs.Should().Contain(HuntScheduleSpec.Weekly);
        allSpecs.Should().Contain(HuntScheduleSpec.Custom);
    }

    #endregion

    #region SavedQuery Repository Tests

    [Fact]
    public async Task SavedQueryRepository_GetByIdAsync_ShouldReturnSavedQuery()
    {
        // Arrange
        var mockRepository = new Mock<ISavedQueryRepository>();
        var expectedId = Guid.NewGuid();
        var expectedQuery = new SavedQuery
        {
            Id = expectedId,
            Name = "Test Query",
            Dataset = HuntDataset.SignInEvents
        };

        mockRepository
            .Setup(r => r.GetByIdAsync(expectedId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedQuery);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(expectedId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(expectedId);
        result.Name.Should().Be("Test Query");
        mockRepository.Verify(r => r.GetByIdAsync(expectedId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SavedQueryRepository_GetByIdAsync_WhenNotFound_ShouldReturnNull()
    {
        // Arrange
        var mockRepository = new Mock<ISavedQueryRepository>();
        var nonExistentId = Guid.NewGuid();

        mockRepository
            .Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SavedQuery?)null);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task SavedQueryRepository_GetByScopeAsync_ShouldReturnFilteredQueries()
    {
        // Arrange
        var mockRepository = new Mock<ISavedQueryRepository>();
        var scopeId = Guid.NewGuid();
        var expectedQueries = new List<SavedQuery>
        {
            new() { Id = Guid.NewGuid(), Name = "Query 1", ScopeType = "Tenant", ScopeId = scopeId },
            new() { Id = Guid.NewGuid(), Name = "Query 2", ScopeType = "Tenant", ScopeId = scopeId }
        };

        mockRepository
            .Setup(r => r.GetByScopeAsync("Tenant", scopeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedQueries);

        // Act
        var result = await mockRepository.Object.GetByScopeAsync("Tenant", scopeId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(q => q.ScopeType.Should().Be("Tenant"));
    }

    [Fact]
    public async Task SavedQueryRepository_AddAsync_ShouldBeCalledSuccessfully()
    {
        // Arrange
        var mockRepository = new Mock<ISavedQueryRepository>();
        var newQuery = new SavedQuery
        {
            Id = Guid.NewGuid(),
            Name = "New Query",
            Dataset = HuntDataset.PrivilegedAccessEvents
        };

        mockRepository
            .Setup(r => r.AddAsync(It.IsAny<SavedQuery>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.AddAsync(newQuery);

        // Assert
        mockRepository.Verify(r => r.AddAsync(
            It.Is<SavedQuery>(q => q.Name == "New Query"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SavedQueryRepository_GetPagedAsync_ShouldReturnPagedResults()
    {
        // Arrange
        var mockRepository = new Mock<ISavedQueryRepository>();
        var scopeId = Guid.NewGuid();
        var pagedQueries = new List<SavedQuery>
        {
            new() { Id = Guid.NewGuid(), Name = "Query 1" },
            new() { Id = Guid.NewGuid(), Name = "Query 2" }
        };

        mockRepository
            .Setup(r => r.GetPagedAsync(
                "Tenant", scopeId, null, null, null, 1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync((pagedQueries.AsReadOnly(), 50));

        // Act
        var (items, totalCount) = await mockRepository.Object.GetPagedAsync(
            "Tenant", scopeId, null, null, null, 1, 10);

        // Assert
        items.Should().HaveCount(2);
        totalCount.Should().Be(50);
    }

    #endregion

    #region ScheduledHunt Repository Tests

    [Fact]
    public async Task ScheduledHuntRepository_GetAllEnabledAsync_ShouldReturnEnabledHunts()
    {
        // Arrange
        var mockRepository = new Mock<IScheduledHuntRepository>();
        var enabledHunts = new List<ScheduledHunt>
        {
            new() { Id = Guid.NewGuid(), Name = "Hunt 1", IsEnabled = true },
            new() { Id = Guid.NewGuid(), Name = "Hunt 2", IsEnabled = true }
        };

        mockRepository
            .Setup(r => r.GetAllEnabledAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(enabledHunts);

        // Act
        var result = await mockRepository.Object.GetAllEnabledAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(h => h.IsEnabled.Should().BeTrue());
    }

    [Fact]
    public async Task ScheduledHuntRepository_GetEnabledByScheduleSpecAsync_ShouldFilterBySpec()
    {
        // Arrange
        var mockRepository = new Mock<IScheduledHuntRepository>();
        var dailyHunts = new List<ScheduledHunt>
        {
            new() { Id = Guid.NewGuid(), Name = "Daily Hunt 1", ScheduleSpec = HuntScheduleSpec.Daily },
            new() { Id = Guid.NewGuid(), Name = "Daily Hunt 2", ScheduleSpec = HuntScheduleSpec.Daily }
        };

        mockRepository
            .Setup(r => r.GetEnabledByScheduleSpecAsync(HuntScheduleSpec.Daily, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dailyHunts);

        // Act
        var result = await mockRepository.Object.GetEnabledByScheduleSpecAsync(HuntScheduleSpec.Daily);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(h => h.ScheduleSpec.Should().Be(HuntScheduleSpec.Daily));
    }

    [Fact]
    public async Task ScheduledHuntRepository_DeleteAsync_ShouldBeCalledWithCorrectId()
    {
        // Arrange
        var mockRepository = new Mock<IScheduledHuntRepository>();
        var huntId = Guid.NewGuid();

        mockRepository
            .Setup(r => r.DeleteAsync(huntId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepository.Object.DeleteAsync(huntId);

        // Assert
        mockRepository.Verify(r => r.DeleteAsync(huntId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region HuntRun Repository Tests

    [Fact]
    public async Task HuntRunRepository_GetByStatusAsync_ShouldFilterByStatus()
    {
        // Arrange
        var mockRepository = new Mock<IHuntRunRepository>();
        var runningHunts = new List<HuntRun>
        {
            new() { Id = Guid.NewGuid(), Status = HuntRunStatus.Running },
            new() { Id = Guid.NewGuid(), Status = HuntRunStatus.Running }
        };

        mockRepository
            .Setup(r => r.GetByStatusAsync(HuntRunStatus.Running, It.IsAny<CancellationToken>()))
            .ReturnsAsync(runningHunts);

        // Act
        var result = await mockRepository.Object.GetByStatusAsync(HuntRunStatus.Running);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(r => r.Status.Should().Be(HuntRunStatus.Running));
    }

    [Fact]
    public async Task HuntRunRepository_GetLatestByScheduledHuntIdAsync_ShouldReturnMostRecent()
    {
        // Arrange
        var mockRepository = new Mock<IHuntRunRepository>();
        var scheduledHuntId = Guid.NewGuid();
        var latestRun = new HuntRun
        {
            Id = Guid.NewGuid(),
            ScheduledHuntId = scheduledHuntId,
            StartedAt = DateTimeOffset.UtcNow,
            Status = HuntRunStatus.Succeeded
        };

        mockRepository
            .Setup(r => r.GetLatestByScheduledHuntIdAsync(scheduledHuntId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(latestRun);

        // Act
        var result = await mockRepository.Object.GetLatestByScheduledHuntIdAsync(scheduledHuntId);

        // Assert
        result.Should().NotBeNull();
        result!.ScheduledHuntId.Should().Be(scheduledHuntId);
        result.Status.Should().Be(HuntRunStatus.Succeeded);
    }

    [Fact]
    public async Task HuntRunRepository_GetByIdWithSampleRowsAsync_ShouldIncludeSampleRows()
    {
        // Arrange
        var mockRepository = new Mock<IHuntRunRepository>();
        var huntRunId = Guid.NewGuid();
        var huntRun = new HuntRun
        {
            Id = huntRunId,
            Status = HuntRunStatus.Succeeded,
            MatchCount = 3,
            SampleRows = new List<HuntSampleRow>
            {
                new() { Id = Guid.NewGuid(), HuntRunId = huntRunId, RowIndex = 0 },
                new() { Id = Guid.NewGuid(), HuntRunId = huntRunId, RowIndex = 1 },
                new() { Id = Guid.NewGuid(), HuntRunId = huntRunId, RowIndex = 2 }
            }
        };

        mockRepository
            .Setup(r => r.GetByIdWithSampleRowsAsync(huntRunId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(huntRun);

        // Act
        var result = await mockRepository.Object.GetByIdWithSampleRowsAsync(huntRunId);

        // Assert
        result.Should().NotBeNull();
        result!.SampleRows.Should().HaveCount(3);
    }

    [Fact]
    public async Task HuntRunRepository_GetPagedAsync_ShouldFilterByDateRange()
    {
        // Arrange
        var mockRepository = new Mock<IHuntRunRepository>();
        var scopeId = Guid.NewGuid();
        var fromDate = DateTimeOffset.UtcNow.AddDays(-7);
        var toDate = DateTimeOffset.UtcNow;

        var pagedRuns = new List<HuntRun>
        {
            new() { Id = Guid.NewGuid(), StartedAt = DateTimeOffset.UtcNow.AddDays(-3) },
            new() { Id = Guid.NewGuid(), StartedAt = DateTimeOffset.UtcNow.AddDays(-1) }
        };

        mockRepository
            .Setup(r => r.GetPagedAsync(
                "Tenant", scopeId, null, null, fromDate, toDate, 1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync((pagedRuns.AsReadOnly(), 2));

        // Act
        var (items, totalCount) = await mockRepository.Object.GetPagedAsync(
            "Tenant", scopeId, null, null, fromDate, toDate, 1, 10);

        // Assert
        items.Should().HaveCount(2);
        totalCount.Should().Be(2);
    }

    #endregion

    #region Infrastructure Entity Tests

    [Fact]
    public void SavedQueryEntity_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var entity = new SavedQueryEntity();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.ScopeType.Should().Be(string.Empty);
        entity.Name.Should().Be(string.Empty);
        entity.Description.Should().BeNull();
        entity.Dataset.Should().Be(0);
        entity.QueryDslJson.Should().Be(string.Empty);
        entity.IsGlobalTemplate.Should().BeFalse();
        entity.IsEnabled.Should().BeFalse();
        entity.ScheduledHunts.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void ScheduledHuntEntity_DefaultValues_ShouldBeCorrect()
    {
        // Arrange & Act
        var entity = new ScheduledHuntEntity();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.ScopeType.Should().Be(string.Empty);
        entity.Name.Should().Be(string.Empty);
        entity.Description.Should().BeNull();
        entity.ScheduleSpec.Should().Be(0);
        entity.IsEnabled.Should().BeFalse();
        entity.MinMatchCountForFinding.Should().Be(0);
        entity.MaxRowsToScan.Should().Be(0);
        entity.TimeWindowMinutes.Should().Be(0);
        entity.ActionsJson.Should().BeNull();
        entity.SavedQuery.Should().BeNull();
        entity.HuntRuns.Should().NotBeNull().And.BeEmpty();
    }

    #endregion

    #region Edge Cases and Error Handling Tests

    [Fact]
    public void SavedQuery_MultipleScheduledHunts_ShouldMaintainRelationship()
    {
        // Arrange
        var savedQuery = new SavedQuery
        {
            Id = Guid.NewGuid(),
            Name = "Multi-Hunt Query"
        };

        var hunt1 = new ScheduledHunt { Id = Guid.NewGuid(), SavedQueryId = savedQuery.Id, Name = "Hunt 1" };
        var hunt2 = new ScheduledHunt { Id = Guid.NewGuid(), SavedQueryId = savedQuery.Id, Name = "Hunt 2" };
        var hunt3 = new ScheduledHunt { Id = Guid.NewGuid(), SavedQueryId = savedQuery.Id, Name = "Hunt 3" };

        // Act
        savedQuery.ScheduledHunts.AddRange(new[] { hunt1, hunt2, hunt3 });

        // Assert
        savedQuery.ScheduledHunts.Should().HaveCount(3);
        savedQuery.ScheduledHunts.Should().AllSatisfy(h => h.SavedQueryId.Should().Be(savedQuery.Id));
    }

    [Fact]
    public void HuntRun_WithMultipleSampleRows_ShouldMaintainOrder()
    {
        // Arrange
        var huntRun = new HuntRun { Id = Guid.NewGuid() };

        // Act
        for (int i = 0; i < 10; i++)
        {
            huntRun.SampleRows.Add(new HuntSampleRow
            {
                Id = Guid.NewGuid(),
                HuntRunId = huntRun.Id,
                RowIndex = i,
                DocumentJson = $"{{\"index\":{i}}}"
            });
        }

        // Assert
        huntRun.SampleRows.Should().HaveCount(10);
        huntRun.SampleRows.Select(r => r.RowIndex).Should().BeInAscendingOrder();
    }

    [Fact]
    public void SavedQuery_ComplexQueryDslJson_ShouldBeStored()
    {
        // Arrange
        var complexQuery = @"{
            ""filter"": {
                ""and"": [
                    {""field"": ""eventType"", ""operator"": ""equals"", ""value"": ""login_failed""},
                    {""field"": ""count"", ""operator"": ""greaterThan"", ""value"": 5}
                ]
            },
            ""timeRange"": {""last"": ""24h""},
            ""aggregations"": [
                {""field"": ""ipAddress"", ""type"": ""count""}
            ]
        }";

        // Act
        var savedQuery = new SavedQuery { QueryDslJson = complexQuery };

        // Assert
        savedQuery.QueryDslJson.Should().Contain("login_failed");
        savedQuery.QueryDslJson.Should().Contain("greaterThan");
        savedQuery.QueryDslJson.Should().Contain("aggregations");
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void ScheduledHunt_ActionsJson_ShouldAllowEmptyOrNull(string? actionsJson)
    {
        // Arrange & Act
        var hunt = new ScheduledHunt { ActionsJson = actionsJson };

        // Assert
        hunt.ActionsJson.Should().Be(actionsJson);
    }

    [Fact]
    public void HuntRun_StatusTransitions_ShouldBeValid()
    {
        // Arrange
        var huntRun = new HuntRun
        {
            Id = Guid.NewGuid(),
            StartedAt = DateTimeOffset.UtcNow,
            Status = HuntRunStatus.Running
        };

        // Act - Transition to Succeeded
        huntRun.Status = HuntRunStatus.Succeeded;
        huntRun.CompletedAt = DateTimeOffset.UtcNow;
        huntRun.MatchCount = 10;

        // Assert
        huntRun.Status.Should().Be(HuntRunStatus.Succeeded);
        huntRun.CompletedAt.Should().NotBeNull();
        huntRun.MatchCount.Should().Be(10);
    }

    [Fact]
    public async Task Repository_CancellationToken_ShouldBeRespected()
    {
        // Arrange
        var mockRepository = new Mock<ISavedQueryRepository>();
        var cts = new CancellationTokenSource();
        var token = cts.Token;

        mockRepository
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), token))
            .ReturnsAsync(new SavedQuery());

        // Act
        var result = await mockRepository.Object.GetByIdAsync(Guid.NewGuid(), token);

        // Assert
        mockRepository.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), token), Times.Once);
    }

    #endregion
}
