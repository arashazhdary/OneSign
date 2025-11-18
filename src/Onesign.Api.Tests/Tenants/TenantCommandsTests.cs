using FluentAssertions;
using Onesign.Modules.Tenants.Application.Commands;
using Onesign.Modules.Tenants.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class TenantCommandsTests
{
    [Fact]
    public void CreateTenantCommand_WhenCreated_HasDefaultValues()
    {
        // Arrange & Act
        var command = new CreateTenantCommand();

        // Assert
        command.Name.Should().BeEmpty();
        command.Slug.Should().BeEmpty();
    }

    [Fact]
    public void CreateTenantCommand_WhenPropertiesSet_ReturnsCorrectValues()
    {
        // Arrange & Act
        var command = new CreateTenantCommand
        {
            Name = "New Tenant",
            Slug = "new-tenant"
        };

        // Assert
        command.Name.Should().Be("New Tenant");
        command.Slug.Should().Be("new-tenant");
    }

    [Fact]
    public void UpdateTenantStatusCommand_WhenCreated_HasDefaultValues()
    {
        // Arrange & Act
        var command = new UpdateTenantStatusCommand();

        // Assert
        command.TenantId.Should().Be(Guid.Empty);
        command.Status.Should().Be(default(TenantStatus));
    }

    [Fact]
    public void UpdateTenantStatusCommand_WhenPropertiesSet_ReturnsCorrectValues()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var command = new UpdateTenantStatusCommand
        {
            TenantId = tenantId,
            Status = TenantStatus.Suspended
        };

        // Assert
        command.TenantId.Should().Be(tenantId);
        command.Status.Should().Be(TenantStatus.Suspended);
    }

    [Theory]
    [InlineData(TenantStatus.Active)]
    [InlineData(TenantStatus.Suspended)]
    [InlineData(TenantStatus.Inactive)]
    public void UpdateTenantStatusCommand_Status_AcceptsAllStatuses(TenantStatus status)
    {
        // Arrange & Act
        var command = new UpdateTenantStatusCommand { Status = status };

        // Assert
        command.Status.Should().Be(status);
    }

    [Fact]
    public void UpdateBrandingCommand_WhenCreated_HasDefaultValues()
    {
        // Arrange & Act
        var command = new UpdateBrandingCommand();

        // Assert
        command.TenantId.Should().Be(Guid.Empty);
        command.LogoUrl.Should().BeNull();
        command.PrimaryColor.Should().BeNull();
    }

    [Fact]
    public void UpdateBrandingCommand_WhenPropertiesSet_ReturnsCorrectValues()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = "#FF5733"
        };

        // Assert
        command.TenantId.Should().Be(tenantId);
        command.LogoUrl.Should().Be("https://example.com/logo.png");
        command.PrimaryColor.Should().Be("#FF5733");
    }

    [Fact]
    public void UpdateBrandingCommand_CanHaveNullLogoUrl()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = null,
            PrimaryColor = "#FF5733"
        };

        // Assert
        command.LogoUrl.Should().BeNull();
        command.PrimaryColor.Should().Be("#FF5733");
    }

    [Fact]
    public void UpdateBrandingCommand_CanHaveNullPrimaryColor()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = null
        };

        // Assert
        command.LogoUrl.Should().Be("https://example.com/logo.png");
        command.PrimaryColor.Should().BeNull();
    }

    [Fact]
    public void UpdateBrandingCommand_CanHaveBothNullValues()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = null,
            PrimaryColor = null
        };

        // Assert
        command.TenantId.Should().Be(tenantId);
        command.LogoUrl.Should().BeNull();
        command.PrimaryColor.Should().BeNull();
    }

    [Fact]
    public void CreateTenantCommand_NameCanContainSpecialCharacters()
    {
        // Arrange & Act
        var command = new CreateTenantCommand
        {
            Name = "Acme Corp & Sons (2024)",
            Slug = "acme-corp"
        };

        // Assert
        command.Name.Should().Be("Acme Corp & Sons (2024)");
    }

    [Fact]
    public void CreateTenantCommand_SlugCanContainHyphensAndNumbers()
    {
        // Arrange & Act
        var command = new CreateTenantCommand
        {
            Name = "Test Tenant",
            Slug = "my-company-2024"
        };

        // Assert
        command.Slug.Should().Be("my-company-2024");
    }

    [Fact]
    public void UpdateBrandingCommand_LogoUrlCanBeComplexUrl()
    {
        // Arrange
        var complexUrl = "https://cdn.example.com/tenants/123/logo.png?v=2&size=large";

        // Act
        var command = new UpdateBrandingCommand
        {
            TenantId = Guid.NewGuid(),
            LogoUrl = complexUrl,
            PrimaryColor = "#FF5733"
        };

        // Assert
        command.LogoUrl.Should().Be(complexUrl);
    }

    [Theory]
    [InlineData("#FFF")]
    [InlineData("#FFFFFF")]
    [InlineData("#ff5733")]
    [InlineData("rgb(255, 87, 51)")]
    [InlineData("rgba(255, 87, 51, 0.5)")]
    public void UpdateBrandingCommand_PrimaryColorAcceptsVariousFormats(string color)
    {
        // Arrange & Act
        var command = new UpdateBrandingCommand
        {
            TenantId = Guid.NewGuid(),
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = color
        };

        // Assert
        command.PrimaryColor.Should().Be(color);
    }
}
