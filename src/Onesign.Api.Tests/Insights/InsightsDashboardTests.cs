using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Insights.Application.Commands;
using Onesign.Modules.Insights.Application.Queries;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Enums;
using Onesign.Modules.Insights.Domain.Repositories;

namespace Onesign.Api.Tests.Insights;

#region CreateDashboardCommand Tests

public class CreateDashboardCommandTests
{
    [Fact]
    public void CreateDashboardCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateDashboardCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Security Dashboard",
            Description = "Overview of security metrics",
            IsDefault = false,
            CreatedBy = Guid.NewGuid(),
            Widgets = new List<DashboardWidgetItem>
            {
                new DashboardWidgetItem
                {
                    Type = (int)WidgetType.Chart,
                    Title = "Login Trends",
                    DataSource = "login_events",
                    Config = new Dictionary<string, string> { { "chartType", "line" } }
                }
            }
        };

        // Assert
        command.Name.Should().Be("Security Dashboard");
        command.Widgets.Should().HaveCount(1);
    }
}

#endregion

#region UpdateDashboardCommand Tests

public class UpdateDashboardCommandTests
{
    [Fact]
    public void UpdateDashboardCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateDashboardCommand
        {
            TenantId = Guid.NewGuid(),
            DashboardId = Guid.NewGuid(),
            Name = "Updated Dashboard",
            Description = "Updated description"
        };

        // Assert
        command.DashboardId.Should().NotBeEmpty();
        command.Name.Should().Be("Updated Dashboard");
    }
}

#endregion

#region CreateReportCommand Tests

public class CreateReportCommandTests
{
    [Fact]
    public void CreateReportCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateReportCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Monthly Security Report",
            Description = "Monthly security metrics report",
            Type = (int)ReportType.Security,
            Schedule = (int)ReportSchedule.Monthly,
            Format = (int)ReportFormat.PDF,
            Recipients = new List<string> { "admin@example.com", "security@example.com" },
            CreatedBy = Guid.NewGuid()
        };

        // Assert
        command.Name.Should().Be("Monthly Security Report");
        command.Schedule.Should().Be((int)ReportSchedule.Monthly);
        command.Recipients.Should().HaveCount(2);
    }
}

#endregion

#region GetMetricsQuery Tests

public class GetMetricsQueryTests
{
    [Fact]
    public void GetMetricsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetMetricsQuery
        {
            TenantId = Guid.NewGuid(),
            MetricNames = new List<string> { "active_users", "login_count", "mfa_usage" },
            StartDate = DateTime.UtcNow.AddDays(-7),
            EndDate = DateTime.UtcNow,
            Granularity = (int)MetricGranularity.Hourly
        };

        // Assert
        query.MetricNames.Should().HaveCount(3);
        query.Granularity.Should().Be((int)MetricGranularity.Hourly);
    }
}

#endregion

#region Dashboard Entity Tests

public class DashboardEntityTests
{
    [Fact]
    public void Dashboard_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var dashboard = new Dashboard(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Dashboard",
            "Description",
            Guid.NewGuid());

        // Assert
        dashboard.Name.Should().Be("Test Dashboard");
        dashboard.IsDefault.Should().BeFalse();
    }

    [Fact]
    public void Dashboard_AddWidget_ShouldAddWidgetToList()
    {
        // Arrange
        var dashboard = new Dashboard(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Dashboard",
            "Desc",
            Guid.NewGuid());

        // Act
        dashboard.AddWidget(WidgetType.Chart, "Widget 1", "data", new Dictionary<string, string>());
        dashboard.AddWidget(WidgetType.Table, "Widget 2", "data", new Dictionary<string, string>());

        // Assert
        dashboard.Widgets.Should().HaveCount(2);
    }
}

#endregion

#region Report Entity Tests

public class ReportEntityTests
{
    [Fact]
    public void Report_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var report = new Report(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Report",
            "Description",
            ReportType.Security,
            ReportSchedule.Weekly,
            ReportFormat.PDF,
            Guid.NewGuid());

        // Assert
        report.Name.Should().Be("Test Report");
        report.Schedule.Should().Be(ReportSchedule.Weekly);
        report.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Report_AddRecipient_ShouldAddToRecipients()
    {
        // Arrange
        var report = new Report(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Report",
            "Desc",
            ReportType.Security,
            ReportSchedule.Daily,
            ReportFormat.PDF,
            Guid.NewGuid());

        // Act
        report.AddRecipient("user1@example.com");
        report.AddRecipient("user2@example.com");

        // Assert
        report.Recipients.Should().HaveCount(2);
    }
}

#endregion

#region WidgetType Enum Tests

public class WidgetTypeEnumTests
{
    [Theory]
    [InlineData(WidgetType.Chart)]
    [InlineData(WidgetType.Table)]
    [InlineData(WidgetType.Counter)]
    [InlineData(WidgetType.Map)]
    public void WidgetType_ShouldHaveCorrectValues(WidgetType type)
    {
        // Assert
        type.Should().BeDefined();
    }
}

#endregion

#region ReportType Enum Tests

public class ReportTypeEnumTests
{
    [Theory]
    [InlineData(ReportType.Security)]
    [InlineData(ReportType.Compliance)]
    [InlineData(ReportType.Usage)]
    [InlineData(ReportType.Audit)]
    public void ReportType_ShouldHaveCorrectValues(ReportType type)
    {
        // Assert
        type.Should().BeDefined();
    }
}

#endregion

#region ReportSchedule Enum Tests

public class ReportScheduleEnumTests
{
    [Theory]
    [InlineData(ReportSchedule.OnDemand)]
    [InlineData(ReportSchedule.Daily)]
    [InlineData(ReportSchedule.Weekly)]
    [InlineData(ReportSchedule.Monthly)]
    public void ReportSchedule_ShouldHaveCorrectValues(ReportSchedule schedule)
    {
        // Assert
        schedule.Should().BeDefined();
    }
}

#endregion

#region MetricGranularity Enum Tests

public class MetricGranularityEnumTests
{
    [Theory]
    [InlineData(MetricGranularity.Minute)]
    [InlineData(MetricGranularity.Hourly)]
    [InlineData(MetricGranularity.Daily)]
    [InlineData(MetricGranularity.Weekly)]
    public void MetricGranularity_ShouldHaveCorrectValues(MetricGranularity granularity)
    {
        // Assert
        granularity.Should().BeDefined();
    }
}

#endregion
