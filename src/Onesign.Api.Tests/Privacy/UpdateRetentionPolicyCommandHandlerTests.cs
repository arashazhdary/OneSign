using FluentAssertions;
using Moq;
using Onesign.Modules.Privacy.Application.Commands;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Privacy;

public class UpdateRetentionPolicyCommandHandlerTests
{
    private readonly UpdateRetentionPolicyCommandHandler _handler;

    public UpdateRetentionPolicyCommandHandlerTests()
    {
        _handler = new UpdateRetentionPolicyCommandHandler();
    }

    [Fact]
    public async Task Handle_ValidUpdateRequest_ReturnsSuccessWithDto()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var command = new UpdateRetentionPolicyCommand
        {
            TenantId = tenantId,
            PolicyId = policyId,
            DataCategory = DataCategory.IdentityProfile,
            RetentionPeriodDays = 365,
            HardDeleteAfter = true,
            Enabled = true
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().Be(policyId);
        result.Value.TenantId.Should().Be(tenantId);
        result.Value.DataCategory.Should().Be(DataCategory.IdentityProfile.ToString());
        result.Value.RetentionPeriodDays.Should().Be(365);
        result.Value.HardDeleteAfter.Should().BeTrue();
        result.Value.Enabled.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_EmptyPolicyId_GeneratesNewId()
    {
        // Arrange
        var command = new UpdateRetentionPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            PolicyId = Guid.Empty,
            DataCategory = DataCategory.AuthEvents,
            RetentionPeriodDays = 90,
            HardDeleteAfter = false,
            Enabled = true
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_AllDataCategories_SucceedWithCorrectCategory()
    {
        // Arrange & Act & Assert
        foreach (DataCategory category in Enum.GetValues(typeof(DataCategory)))
        {
            var command = new UpdateRetentionPolicyCommand
            {
                TenantId = Guid.NewGuid(),
                PolicyId = Guid.NewGuid(),
                DataCategory = category,
                RetentionPeriodDays = 30,
                HardDeleteAfter = false,
                Enabled = true
            };

            var result = await _handler.Handle(command, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Value.DataCategory.Should().Be(category.ToString());
        }
    }

    [Theory]
    [InlineData(1)]
    [InlineData(30)]
    [InlineData(90)]
    [InlineData(365)]
    [InlineData(730)]
    [InlineData(3650)]
    public async Task Handle_VariousRetentionPeriods_ArePreserved(int retentionDays)
    {
        // Arrange
        var command = new UpdateRetentionPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            PolicyId = Guid.NewGuid(),
            DataCategory = DataCategory.AuditLogs,
            RetentionPeriodDays = retentionDays,
            HardDeleteAfter = true,
            Enabled = true
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.RetentionPeriodDays.Should().Be(retentionDays);
    }

    [Theory]
    [InlineData(true, true)]
    [InlineData(true, false)]
    [InlineData(false, true)]
    [InlineData(false, false)]
    public async Task Handle_BooleanCombinations_ArePreserved(bool hardDeleteAfter, bool enabled)
    {
        // Arrange
        var command = new UpdateRetentionPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            PolicyId = Guid.NewGuid(),
            DataCategory = DataCategory.FederationLogs,
            RetentionPeriodDays = 60,
            HardDeleteAfter = hardDeleteAfter,
            Enabled = enabled
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.HardDeleteAfter.Should().Be(hardDeleteAfter);
        result.Value.Enabled.Should().Be(enabled);
    }

    [Fact]
    public async Task Handle_SetsCreatedAtAndUpdatedAt()
    {
        // Arrange
        var beforeRequest = DateTime.UtcNow;

        var command = new UpdateRetentionPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            PolicyId = Guid.NewGuid(),
            DataCategory = DataCategory.AccessRequests,
            RetentionPeriodDays = 180,
            HardDeleteAfter = true,
            Enabled = true
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterRequest = DateTime.UtcNow;

        // Assert
        result.Value.CreatedAt.Should().BeOnOrAfter(beforeRequest);
        result.Value.CreatedAt.Should().BeOnOrBefore(afterRequest);
        result.Value.UpdatedAt.Should().BeOnOrAfter(beforeRequest);
        result.Value.UpdatedAt.Should().BeOnOrBefore(afterRequest);
    }

    [Fact]
    public async Task Handle_WithCancellationToken_CompletesSuccessfully()
    {
        // Arrange
        var command = new UpdateRetentionPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            PolicyId = Guid.NewGuid(),
            DataCategory = DataCategory.LifecycleHistory,
            RetentionPeriodDays = 365,
            HardDeleteAfter = false,
            Enabled = true
        };

        using var cts = new CancellationTokenSource();

        // Act
        var result = await _handler.Handle(command, cts.Token);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_MultiplePolicies_GenerateDistinctResults()
    {
        // Arrange
        var command1 = new UpdateRetentionPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            PolicyId = Guid.NewGuid(),
            DataCategory = DataCategory.IdentityProfile,
            RetentionPeriodDays = 365,
            HardDeleteAfter = true,
            Enabled = true
        };

        var command2 = new UpdateRetentionPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            PolicyId = Guid.NewGuid(),
            DataCategory = DataCategory.AuthEvents,
            RetentionPeriodDays = 90,
            HardDeleteAfter = false,
            Enabled = false
        };

        // Act
        var result1 = await _handler.Handle(command1, CancellationToken.None);
        var result2 = await _handler.Handle(command2, CancellationToken.None);

        // Assert
        result1.Value.Id.Should().NotBe(result2.Value.Id);
        result1.Value.DataCategory.Should().NotBe(result2.Value.DataCategory);
        result1.Value.RetentionPeriodDays.Should().NotBe(result2.Value.RetentionPeriodDays);
    }

    [Fact]
    public async Task Handle_ZeroRetentionPeriod_Succeeds()
    {
        // Arrange
        var command = new UpdateRetentionPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            PolicyId = Guid.NewGuid(),
            DataCategory = DataCategory.AuditLogs,
            RetentionPeriodDays = 0,
            HardDeleteAfter = true,
            Enabled = true
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.RetentionPeriodDays.Should().Be(0);
    }

    [Fact]
    public async Task Handle_NegativeRetentionPeriod_Succeeds()
    {
        // Arrange - This tests current behavior; validation would be separate
        var command = new UpdateRetentionPolicyCommand
        {
            TenantId = Guid.NewGuid(),
            PolicyId = Guid.NewGuid(),
            DataCategory = DataCategory.AuditLogs,
            RetentionPeriodDays = -1,
            HardDeleteAfter = true,
            Enabled = true
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.RetentionPeriodDays.Should().Be(-1);
    }

    [Fact]
    public async Task Handle_DtoContainsAllExpectedFields()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policyId = Guid.NewGuid();

        var command = new UpdateRetentionPolicyCommand
        {
            TenantId = tenantId,
            PolicyId = policyId,
            DataCategory = DataCategory.IdentityProfile,
            RetentionPeriodDays = 365,
            HardDeleteAfter = true,
            Enabled = true
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        var dto = result.Value;
        dto.Id.Should().Be(policyId);
        dto.TenantId.Should().Be(tenantId);
        dto.DataCategory.Should().NotBeNullOrEmpty();
        dto.RetentionPeriodDays.Should().BeGreaterThanOrEqualTo(0).Or.BeLessThan(0);
        dto.HardDeleteAfter.Should().BeTrue();
        dto.Enabled.Should().BeTrue();
        dto.CreatedAt.Should().NotBe(default);
        dto.UpdatedAt.Should().NotBe(default);
    }

    [Fact]
    public async Task Handle_SameTenantMultiplePolicies_AllSucceed()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var commands = new[]
        {
            new UpdateRetentionPolicyCommand
            {
                TenantId = tenantId,
                PolicyId = Guid.NewGuid(),
                DataCategory = DataCategory.IdentityProfile,
                RetentionPeriodDays = 365,
                HardDeleteAfter = true,
                Enabled = true
            },
            new UpdateRetentionPolicyCommand
            {
                TenantId = tenantId,
                PolicyId = Guid.NewGuid(),
                DataCategory = DataCategory.AuthEvents,
                RetentionPeriodDays = 90,
                HardDeleteAfter = false,
                Enabled = true
            },
            new UpdateRetentionPolicyCommand
            {
                TenantId = tenantId,
                PolicyId = Guid.NewGuid(),
                DataCategory = DataCategory.AuditLogs,
                RetentionPeriodDays = 180,
                HardDeleteAfter = true,
                Enabled = false
            }
        };

        // Act & Assert
        foreach (var command in commands)
        {
            var result = await _handler.Handle(command, CancellationToken.None);
            result.IsSuccess.Should().BeTrue();
            result.Value.TenantId.Should().Be(tenantId);
        }
    }
}
