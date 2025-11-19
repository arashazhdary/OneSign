using FluentAssertions;
using Moq;
using Onesign.Modules.Billing.Application.Commands;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Billing;

public class RecordUsageEventCommandHandlerTests
{
    private readonly Mock<IUsageRepository> _usageRepositoryMock;
    private readonly RecordUsageEventCommandHandler _handler;

    public RecordUsageEventCommandHandlerTests()
    {
        _usageRepositoryMock = new Mock<IUsageRepository>();
        _handler = new RecordUsageEventCommandHandler(_usageRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_NewCounter_CreatesNewCounter()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new RecordUsageEventCommand
        {
            TenantId = tenantId,
            MetricType = UsageMetricType.Logins,
            Amount = 1
        };

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.Logins,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);

        UsageCounter? capturedCounter = null;
        _usageRepositoryMock.Setup(x => x.UpsertCounterAsync(It.IsAny<UsageCounter>(), It.IsAny<CancellationToken>()))
            .Callback<UsageCounter, CancellationToken>((counter, _) => capturedCounter = counter)
            .ReturnsAsync((UsageCounter counter, CancellationToken _) => counter);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeTrue();

        capturedCounter.Should().NotBeNull();
        capturedCounter!.TenantId.Should().Be(tenantId);
        capturedCounter.MetricType.Should().Be(UsageMetricType.Logins);
        capturedCounter.Value.Should().Be(1);
        capturedCounter.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_ExistingCounter_IncrementsValue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var existingCounter = new UsageCounter
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            MetricType = UsageMetricType.Logins,
            PeriodYear = DateTime.UtcNow.Year,
            PeriodMonth = DateTime.UtcNow.Month,
            Value = 100,
            CreatedAt = DateTime.UtcNow.AddDays(-15)
        };

        var command = new RecordUsageEventCommand
        {
            TenantId = tenantId,
            MetricType = UsageMetricType.Logins,
            Amount = 5
        };

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.Logins,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCounter);

        UsageCounter? capturedCounter = null;
        _usageRepositoryMock.Setup(x => x.UpsertCounterAsync(It.IsAny<UsageCounter>(), It.IsAny<CancellationToken>()))
            .Callback<UsageCounter, CancellationToken>((counter, _) => capturedCounter = counter)
            .ReturnsAsync((UsageCounter counter, CancellationToken _) => counter);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedCounter.Should().NotBeNull();
        capturedCounter!.Value.Should().Be(105); // 100 + 5
    }

    [Theory]
    [InlineData(UsageMetricType.Users)]
    [InlineData(UsageMetricType.ActiveUsers)]
    [InlineData(UsageMetricType.Applications)]
    [InlineData(UsageMetricType.Logins)]
    [InlineData(UsageMetricType.IdpConnections)]
    [InlineData(UsageMetricType.ScimCalls)]
    [InlineData(UsageMetricType.OrgUnits)]
    public async Task Handle_AllMetricTypes_RecordsSuccessfully(UsageMetricType metricType)
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new RecordUsageEventCommand
        {
            TenantId = tenantId,
            MetricType = metricType,
            Amount = 1
        };

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                metricType,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);

        UsageCounter? capturedCounter = null;
        _usageRepositoryMock.Setup(x => x.UpsertCounterAsync(It.IsAny<UsageCounter>(), It.IsAny<CancellationToken>()))
            .Callback<UsageCounter, CancellationToken>((counter, _) => capturedCounter = counter)
            .ReturnsAsync((UsageCounter counter, CancellationToken _) => counter);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedCounter!.MetricType.Should().Be(metricType);
    }

    [Fact]
    public async Task Handle_CustomAmount_SetsCorrectValue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new RecordUsageEventCommand
        {
            TenantId = tenantId,
            MetricType = UsageMetricType.ScimCalls,
            Amount = 100
        };

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.ScimCalls,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);

        UsageCounter? capturedCounter = null;
        _usageRepositoryMock.Setup(x => x.UpsertCounterAsync(It.IsAny<UsageCounter>(), It.IsAny<CancellationToken>()))
            .Callback<UsageCounter, CancellationToken>((counter, _) => capturedCounter = counter)
            .ReturnsAsync((UsageCounter counter, CancellationToken _) => counter);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedCounter!.Value.Should().Be(100);
    }

    [Fact]
    public async Task Handle_NewCounter_SetsCorrectPeriod()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var command = new RecordUsageEventCommand
        {
            TenantId = tenantId,
            MetricType = UsageMetricType.Logins,
            Amount = 1
        };

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.Logins,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);

        UsageCounter? capturedCounter = null;
        _usageRepositoryMock.Setup(x => x.UpsertCounterAsync(It.IsAny<UsageCounter>(), It.IsAny<CancellationToken>()))
            .Callback<UsageCounter, CancellationToken>((counter, _) => capturedCounter = counter)
            .ReturnsAsync((UsageCounter counter, CancellationToken _) => counter);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedCounter!.PeriodYear.Should().Be(now.Year);
        capturedCounter.PeriodMonth.Should().Be(now.Month);
    }

    [Fact]
    public async Task Handle_NewCounter_SetsCreatedAt()
    {
        // Arrange
        var beforeTime = DateTime.UtcNow;
        var tenantId = Guid.NewGuid();
        var command = new RecordUsageEventCommand
        {
            TenantId = tenantId,
            MetricType = UsageMetricType.Logins,
            Amount = 1
        };

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.Logins,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);

        UsageCounter? capturedCounter = null;
        _usageRepositoryMock.Setup(x => x.UpsertCounterAsync(It.IsAny<UsageCounter>(), It.IsAny<CancellationToken>()))
            .Callback<UsageCounter, CancellationToken>((counter, _) => capturedCounter = counter)
            .ReturnsAsync((UsageCounter counter, CancellationToken _) => counter);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterTime = DateTime.UtcNow;

        // Assert
        capturedCounter!.CreatedAt.Should().BeOnOrAfter(beforeTime);
        capturedCounter.CreatedAt.Should().BeOnOrBefore(afterTime);
    }

    [Fact]
    public async Task Handle_ExistingCounter_SetsUpdatedAt()
    {
        // Arrange
        var beforeTime = DateTime.UtcNow;
        var tenantId = Guid.NewGuid();
        var existingCounter = new UsageCounter
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            MetricType = UsageMetricType.Logins,
            PeriodYear = DateTime.UtcNow.Year,
            PeriodMonth = DateTime.UtcNow.Month,
            Value = 50,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        var command = new RecordUsageEventCommand
        {
            TenantId = tenantId,
            MetricType = UsageMetricType.Logins,
            Amount = 1
        };

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.Logins,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCounter);

        _usageRepositoryMock.Setup(x => x.UpsertCounterAsync(It.IsAny<UsageCounter>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter counter, CancellationToken _) => counter);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        var afterTime = DateTime.UtcNow;

        // Assert
        existingCounter.UpdatedAt.Should().NotBeNull();
        existingCounter.UpdatedAt!.Value.Should().BeOnOrAfter(beforeTime);
        existingCounter.UpdatedAt.Value.Should().BeOnOrBefore(afterTime);
    }

    [Fact]
    public async Task Handle_MultipleIncrements_AccumulatesCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var counter = new UsageCounter
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            MetricType = UsageMetricType.Logins,
            PeriodYear = DateTime.UtcNow.Year,
            PeriodMonth = DateTime.UtcNow.Month,
            Value = 0,
            CreatedAt = DateTime.UtcNow
        };

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.Logins,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(counter);

        _usageRepositoryMock.Setup(x => x.UpsertCounterAsync(It.IsAny<UsageCounter>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter c, CancellationToken _) => c);

        // Act - Simulate multiple increments
        for (int i = 0; i < 5; i++)
        {
            var command = new RecordUsageEventCommand
            {
                TenantId = tenantId,
                MetricType = UsageMetricType.Logins,
                Amount = 10
            };
            await _handler.Handle(command, CancellationToken.None);
        }

        // Assert
        counter.Value.Should().Be(50); // 5 * 10
    }

    [Fact]
    public async Task Handle_QueriesCorrectPeriod()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var command = new RecordUsageEventCommand
        {
            TenantId = tenantId,
            MetricType = UsageMetricType.Logins,
            Amount = 1
        };

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.Logins,
                now.Year,
                now.Month,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);

        _usageRepositoryMock.Setup(x => x.UpsertCounterAsync(It.IsAny<UsageCounter>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter counter, CancellationToken _) => counter);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _usageRepositoryMock.Verify(x => x.GetCounterAsync(
            tenantId,
            UsageMetricType.Logins,
            now.Year,
            now.Month,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_LargeAmount_HandlesCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new RecordUsageEventCommand
        {
            TenantId = tenantId,
            MetricType = UsageMetricType.ScimCalls,
            Amount = 1_000_000
        };

        _usageRepositoryMock.Setup(x => x.GetCounterAsync(
                tenantId,
                UsageMetricType.ScimCalls,
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((UsageCounter?)null);

        UsageCounter? capturedCounter = null;
        _usageRepositoryMock.Setup(x => x.UpsertCounterAsync(It.IsAny<UsageCounter>(), It.IsAny<CancellationToken>()))
            .Callback<UsageCounter, CancellationToken>((counter, _) => capturedCounter = counter)
            .ReturnsAsync((UsageCounter counter, CancellationToken _) => counter);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedCounter!.Value.Should().Be(1_000_000);
    }
}
