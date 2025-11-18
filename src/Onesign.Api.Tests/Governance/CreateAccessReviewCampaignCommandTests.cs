using FluentAssertions;
using Onesign.Modules.Governance.Application.Commands;
using Onesign.Modules.Governance.Application.DTOs;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Governance;

public class CreateAccessReviewCampaignCommandTests
{
    [Fact]
    public void Command_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var tenantId = Guid.NewGuid();
        var createdBy = Guid.NewGuid();
        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(30);

        var command = new CreateAccessReviewCampaignCommand
        {
            TenantId = tenantId,
            Name = "Q4 Access Review",
            Description = "Quarterly access review for all departments",
            StartDate = startDate,
            EndDate = endDate,
            TargetRoles = new List<string> { "Admin", "Manager", "Developer" },
            CreatedBy = createdBy
        };

        // Assert
        command.TenantId.Should().Be(tenantId);
        command.Name.Should().Be("Q4 Access Review");
        command.Description.Should().Be("Quarterly access review for all departments");
        command.StartDate.Should().Be(startDate);
        command.EndDate.Should().Be(endDate);
        command.TargetRoles.Should().HaveCount(3);
        command.TargetRoles.Should().Contain("Admin");
        command.TargetRoles.Should().Contain("Manager");
        command.TargetRoles.Should().Contain("Developer");
        command.CreatedBy.Should().Be(createdBy);
    }

    [Fact]
    public void Command_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var command = new CreateAccessReviewCampaignCommand();

        // Assert
        command.TenantId.Should().Be(Guid.Empty);
        command.Name.Should().BeEmpty();
        command.Description.Should().BeEmpty();
        command.StartDate.Should().Be(default);
        command.EndDate.Should().Be(default);
        command.TargetRoles.Should().NotBeNull();
        command.TargetRoles.Should().BeEmpty();
        command.CreatedBy.Should().Be(Guid.Empty);
    }

    [Fact]
    public void Command_ImplementsIRequest_WithCorrectResultType()
    {
        // Arrange
        var command = new CreateAccessReviewCampaignCommand();

        // Assert
        command.Should().BeAssignableTo<MediatR.IRequest<Result<CampaignDto>>>();
    }

    [Fact]
    public void Command_TargetRoles_CanBeModified()
    {
        // Arrange
        var command = new CreateAccessReviewCampaignCommand();

        // Act
        command.TargetRoles.Add("Admin");
        command.TargetRoles.Add("User");

        // Assert
        command.TargetRoles.Should().HaveCount(2);
        command.TargetRoles.Should().Contain("Admin");
        command.TargetRoles.Should().Contain("User");
    }

    [Fact]
    public void Command_WithEmptyTargetRoles_IsValid()
    {
        // Arrange & Act
        var command = new CreateAccessReviewCampaignCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Campaign",
            Description = "Test",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7),
            TargetRoles = new List<string>(),
            CreatedBy = Guid.NewGuid()
        };

        // Assert
        command.TargetRoles.Should().BeEmpty();
    }

    [Fact]
    public void Command_CanSetSingleRole()
    {
        // Arrange & Act
        var command = new CreateAccessReviewCampaignCommand
        {
            TargetRoles = new List<string> { "SingleRole" }
        };

        // Assert
        command.TargetRoles.Should().HaveCount(1);
        command.TargetRoles[0].Should().Be("SingleRole");
    }

    [Fact]
    public void Command_CanSetManyRoles()
    {
        // Arrange
        var roles = Enumerable.Range(1, 100).Select(i => $"Role{i}").ToList();

        // Act
        var command = new CreateAccessReviewCampaignCommand
        {
            TargetRoles = roles
        };

        // Assert
        command.TargetRoles.Should().HaveCount(100);
        command.TargetRoles.Should().Contain("Role1");
        command.TargetRoles.Should().Contain("Role100");
    }

    [Fact]
    public void Command_DateRange_IsValid()
    {
        // Arrange
        var startDate = DateTime.UtcNow;
        var endDate = DateTime.UtcNow.AddDays(30);

        // Act
        var command = new CreateAccessReviewCampaignCommand
        {
            StartDate = startDate,
            EndDate = endDate
        };

        // Assert
        command.StartDate.Should().BeBefore(command.EndDate);
        (command.EndDate - command.StartDate).Days.Should().Be(30);
    }

    [Fact]
    public void Command_WithPastDates_IsAllowed()
    {
        // Arrange & Act - Validation would be separate
        var command = new CreateAccessReviewCampaignCommand
        {
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow.AddDays(-1)
        };

        // Assert
        command.StartDate.Should().BeBefore(DateTime.UtcNow);
        command.EndDate.Should().BeBefore(DateTime.UtcNow);
    }

    [Fact]
    public void Command_WithLongName_IsAllowed()
    {
        // Arrange & Act
        var longName = new string('A', 500);
        var command = new CreateAccessReviewCampaignCommand
        {
            Name = longName
        };

        // Assert
        command.Name.Should().HaveLength(500);
    }

    [Fact]
    public void Command_WithLongDescription_IsAllowed()
    {
        // Arrange & Act
        var longDescription = new string('B', 2000);
        var command = new CreateAccessReviewCampaignCommand
        {
            Description = longDescription
        };

        // Assert
        command.Description.Should().HaveLength(2000);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Admin")]
    [InlineData("Super Long Role Name With Many Words")]
    public void Command_WithVariousRoleNames_IsAllowed(string roleName)
    {
        // Arrange & Act
        var command = new CreateAccessReviewCampaignCommand
        {
            TargetRoles = new List<string> { roleName }
        };

        // Assert
        command.TargetRoles.Should().Contain(roleName);
    }

    [Fact]
    public void Command_MultipleInstances_AreIndependent()
    {
        // Arrange & Act
        var command1 = new CreateAccessReviewCampaignCommand
        {
            Name = "Campaign 1",
            TargetRoles = new List<string> { "Role1" }
        };

        var command2 = new CreateAccessReviewCampaignCommand
        {
            Name = "Campaign 2",
            TargetRoles = new List<string> { "Role2" }
        };

        // Assert
        command1.Name.Should().NotBe(command2.Name);
        command1.TargetRoles.Should().NotContain("Role2");
        command2.TargetRoles.Should().NotContain("Role1");
    }

    [Fact]
    public void Command_DuplicateRoles_AreAllowed()
    {
        // Arrange & Act
        var command = new CreateAccessReviewCampaignCommand
        {
            TargetRoles = new List<string> { "Admin", "Admin", "User" }
        };

        // Assert
        command.TargetRoles.Should().HaveCount(3);
        command.TargetRoles.Count(r => r == "Admin").Should().Be(2);
    }

    [Fact]
    public void Command_SameDayStartAndEnd_IsAllowed()
    {
        // Arrange
        var today = DateTime.UtcNow.Date;

        // Act
        var command = new CreateAccessReviewCampaignCommand
        {
            StartDate = today,
            EndDate = today
        };

        // Assert
        command.StartDate.Should().Be(command.EndDate);
    }

    [Fact]
    public void Command_EndBeforeStart_IsAllowed()
    {
        // Arrange & Act - Validation would be separate concern
        var command = new CreateAccessReviewCampaignCommand
        {
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow
        };

        // Assert
        command.EndDate.Should().BeBefore(command.StartDate);
    }
}
