using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Hunting.Application.Commands;
using Onesign.Modules.Hunting.Application.Queries;
using Onesign.Modules.Hunting.Domain.Entities;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Modules.Hunting.Domain.Repositories;

namespace Onesign.Api.Tests.Hunting;

#region CreateHuntCommand Tests

public class CreateHuntCommandTests
{
    [Fact]
    public void CreateHuntCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateHuntCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Lateral Movement Detection",
            Description = "Hunt for lateral movement indicators",
            Hypothesis = "Attackers may be moving laterally through the network",
            Query = "SELECT * FROM LoginEvents WHERE SourceIP != TargetIP",
            DataSources = new List<string> { "LoginEvents", "NetworkLogs" },
            Tags = new List<string> { "lateral-movement", "network" },
            CreatedBy = Guid.NewGuid()
        };

        // Assert
        command.Name.Should().Be("Lateral Movement Detection");
        command.Hypothesis.Should().NotBeEmpty();
        command.DataSources.Should().HaveCount(2);
    }
}

#endregion

#region UpdateHuntCommand Tests

public class UpdateHuntCommandTests
{
    [Fact]
    public void UpdateHuntCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateHuntCommand
        {
            TenantId = Guid.NewGuid(),
            HuntId = Guid.NewGuid(),
            Name = "Updated Hunt",
            Description = "Updated description",
            Query = "SELECT * FROM UpdatedTable"
        };

        // Assert
        command.HuntId.Should().NotBeEmpty();
        command.Name.Should().Be("Updated Hunt");
    }
}

#endregion

#region ExecuteHuntCommand Tests

public class ExecuteHuntCommandTests
{
    [Fact]
    public void ExecuteHuntCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ExecuteHuntCommand
        {
            TenantId = Guid.NewGuid(),
            HuntId = Guid.NewGuid(),
            ExecutedBy = Guid.NewGuid(),
            Parameters = new Dictionary<string, string>
            {
                { "startDate", DateTime.UtcNow.AddDays(-7).ToString("o") },
                { "endDate", DateTime.UtcNow.ToString("o") }
            }
        };

        // Assert
        command.HuntId.Should().NotBeEmpty();
        command.Parameters.Should().ContainKey("startDate");
    }
}

#endregion

#region RecordHuntFindingCommand Tests

public class RecordHuntFindingCommandTests
{
    [Fact]
    public void RecordHuntFindingCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RecordHuntFindingCommand
        {
            TenantId = Guid.NewGuid(),
            HuntId = Guid.NewGuid(),
            ExecutionId = Guid.NewGuid(),
            Title = "Suspicious Login Pattern",
            Description = "Multiple failed logins followed by success",
            Severity = (int)FindingSeverity.High,
            Evidence = new Dictionary<string, string>
            {
                { "sourceIP", "10.0.0.1" },
                { "attempts", "15" }
            },
            Recommendation = "Investigate user account and block IP"
        };

        // Assert
        command.Title.Should().Be("Suspicious Login Pattern");
        command.Severity.Should().Be((int)FindingSeverity.High);
        command.Evidence.Should().ContainKey("sourceIP");
    }
}

#endregion

#region CompleteHuntCommand Tests

public class CompleteHuntCommandTests
{
    [Fact]
    public void CompleteHuntCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CompleteHuntCommand
        {
            TenantId = Guid.NewGuid(),
            HuntId = Guid.NewGuid(),
            ExecutionId = Guid.NewGuid(),
            Summary = "Hunt completed with 3 findings",
            Conclusion = "Evidence of lateral movement detected"
        };

        // Assert
        command.Summary.Should().Be("Hunt completed with 3 findings");
        command.Conclusion.Should().NotBeEmpty();
    }
}

#endregion

#region ArchiveHuntCommand Tests

public class ArchiveHuntCommandTests
{
    [Fact]
    public void ArchiveHuntCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ArchiveHuntCommand
        {
            TenantId = Guid.NewGuid(),
            HuntId = Guid.NewGuid(),
            ArchivedBy = Guid.NewGuid(),
            Reason = "No longer relevant"
        };

        // Assert
        command.Reason.Should().Be("No longer relevant");
    }
}

#endregion

#region GetHuntsQuery Tests

public class GetHuntsQueryTests
{
    [Fact]
    public void GetHuntsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetHuntsQuery
        {
            TenantId = Guid.NewGuid(),
            Status = (int)HuntStatus.Active,
            CreatedBy = Guid.NewGuid(),
            Tag = "network",
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.Status.Should().Be((int)HuntStatus.Active);
        query.Tag.Should().Be("network");
    }
}

#endregion

#region GetHuntDetailsQuery Tests

public class GetHuntDetailsQueryTests
{
    [Fact]
    public void GetHuntDetailsQuery_ShouldHaveHuntId()
    {
        // Arrange & Act
        var huntId = Guid.NewGuid();
        var query = new GetHuntDetailsQuery
        {
            TenantId = Guid.NewGuid(),
            HuntId = huntId
        };

        // Assert
        query.HuntId.Should().Be(huntId);
    }
}

#endregion

#region GetHuntExecutionsQuery Tests

public class GetHuntExecutionsQueryTests
{
    [Fact]
    public void GetHuntExecutionsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetHuntExecutionsQuery
        {
            TenantId = Guid.NewGuid(),
            HuntId = Guid.NewGuid(),
            Status = (int)HuntExecutionStatus.Completed,
            PageNumber = 1,
            PageSize = 10
        };

        // Assert
        query.HuntId.Should().NotBeEmpty();
        query.Status.Should().Be((int)HuntExecutionStatus.Completed);
    }
}

#endregion

#region GetHuntFindingsQuery Tests

public class GetHuntFindingsQueryTests
{
    [Fact]
    public void GetHuntFindingsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetHuntFindingsQuery
        {
            TenantId = Guid.NewGuid(),
            HuntId = Guid.NewGuid(),
            ExecutionId = Guid.NewGuid(),
            Severity = (int)FindingSeverity.Critical
        };

        // Assert
        query.Severity.Should().Be((int)FindingSeverity.Critical);
    }
}

#endregion

#region Hunt Entity Tests

public class HuntEntityTests
{
    [Fact]
    public void Hunt_ShouldBeCreatedWithDraftStatus()
    {
        // Arrange & Act
        var hunt = new Hunt(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Hunt",
            "Description",
            "Hypothesis",
            "SELECT * FROM Events",
            Guid.NewGuid());

        // Assert
        hunt.Status.Should().Be(HuntStatus.Draft);
        hunt.Name.Should().Be("Test Hunt");
    }

    [Fact]
    public void Hunt_Activate_ShouldChangeStatusToActive()
    {
        // Arrange
        var hunt = new Hunt(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Hunt",
            "Desc",
            "Hypothesis",
            "Query",
            Guid.NewGuid());

        // Act
        hunt.Activate();

        // Assert
        hunt.Status.Should().Be(HuntStatus.Active);
    }

    [Fact]
    public void Hunt_Archive_ShouldChangeStatusToArchived()
    {
        // Arrange
        var hunt = new Hunt(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Hunt",
            "Desc",
            "Hypothesis",
            "Query",
            Guid.NewGuid());
        hunt.Activate();

        // Act
        hunt.Archive("No longer needed");

        // Assert
        hunt.Status.Should().Be(HuntStatus.Archived);
    }

    [Fact]
    public void Hunt_AddDataSource_ShouldAddToList()
    {
        // Arrange
        var hunt = new Hunt(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Hunt",
            "Desc",
            "Hypothesis",
            "Query",
            Guid.NewGuid());

        // Act
        hunt.AddDataSource("LoginEvents");
        hunt.AddDataSource("NetworkLogs");

        // Assert
        hunt.DataSources.Should().HaveCount(2);
        hunt.DataSources.Should().Contain("LoginEvents");
    }

    [Fact]
    public void Hunt_AddTag_ShouldAddToList()
    {
        // Arrange
        var hunt = new Hunt(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Hunt",
            "Desc",
            "Hypothesis",
            "Query",
            Guid.NewGuid());

        // Act
        hunt.AddTag("security");
        hunt.AddTag("network");

        // Assert
        hunt.Tags.Should().HaveCount(2);
    }
}

#endregion

#region HuntExecution Entity Tests

public class HuntExecutionEntityTests
{
    [Fact]
    public void HuntExecution_ShouldBeCreatedWithRunningStatus()
    {
        // Arrange & Act
        var execution = new HuntExecution(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Assert
        execution.Status.Should().Be(HuntExecutionStatus.Running);
        execution.StartedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void HuntExecution_Complete_ShouldChangeStatusToCompleted()
    {
        // Arrange
        var execution = new HuntExecution(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Act
        execution.Complete("Summary", "Conclusion");

        // Assert
        execution.Status.Should().Be(HuntExecutionStatus.Completed);
        execution.CompletedAt.Should().NotBeNull();
        execution.Summary.Should().Be("Summary");
    }

    [Fact]
    public void HuntExecution_Fail_ShouldChangeStatusToFailed()
    {
        // Arrange
        var execution = new HuntExecution(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid());

        // Act
        execution.Fail("Query timeout");

        // Assert
        execution.Status.Should().Be(HuntExecutionStatus.Failed);
        execution.ErrorMessage.Should().Be("Query timeout");
    }
}

#endregion

#region HuntFinding Entity Tests

public class HuntFindingEntityTests
{
    [Fact]
    public void HuntFinding_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var finding = new HuntFinding(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Finding Title",
            "Description",
            FindingSeverity.High);

        // Assert
        finding.Title.Should().Be("Finding Title");
        finding.Severity.Should().Be(FindingSeverity.High);
    }

    [Fact]
    public void HuntFinding_AddEvidence_ShouldAddToEvidence()
    {
        // Arrange
        var finding = new HuntFinding(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Title",
            "Desc",
            FindingSeverity.Medium);

        // Act
        finding.AddEvidence("key1", "value1");
        finding.AddEvidence("key2", "value2");

        // Assert
        finding.Evidence.Should().HaveCount(2);
    }
}

#endregion

#region HuntStatus Enum Tests

public class HuntStatusEnumTests
{
    [Theory]
    [InlineData(HuntStatus.Draft)]
    [InlineData(HuntStatus.Active)]
    [InlineData(HuntStatus.Archived)]
    public void HuntStatus_ShouldHaveCorrectValues(HuntStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion

#region HuntExecutionStatus Enum Tests

public class HuntExecutionStatusEnumTests
{
    [Theory]
    [InlineData(HuntExecutionStatus.Running)]
    [InlineData(HuntExecutionStatus.Completed)]
    [InlineData(HuntExecutionStatus.Failed)]
    [InlineData(HuntExecutionStatus.Cancelled)]
    public void HuntExecutionStatus_ShouldHaveCorrectValues(HuntExecutionStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion

#region FindingSeverity Enum Tests

public class FindingSeverityEnumTests
{
    [Theory]
    [InlineData(FindingSeverity.Low)]
    [InlineData(FindingSeverity.Medium)]
    [InlineData(FindingSeverity.High)]
    [InlineData(FindingSeverity.Critical)]
    public void FindingSeverity_ShouldHaveCorrectValues(FindingSeverity severity)
    {
        // Assert
        severity.Should().BeDefined();
    }
}

#endregion
