using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Deployment.Application.Commands;
using Onesign.Modules.Deployment.Application.Queries;
using Onesign.Modules.Deployment.Domain.Enums;
using Onesign.Modules.Deployment.Domain.Services;

namespace Onesign.Api.Tests.Deployment;

public class DeploymentHandlerTests
{
    private readonly Mock<IEnvironmentBootstrapService> _bootstrapServiceMock;
    private readonly Mock<ILogger<BootstrapEnvironmentCommandHandler>> _bootstrapLoggerMock;
    private readonly Mock<ILogger<UpdateEnvironmentHeartbeatCommandHandler>> _heartbeatLoggerMock;
    private readonly Mock<ILogger<GetEnvironmentsQueryHandler>> _getEnvsLoggerMock;
    private readonly Mock<ILogger<GetEnvironmentByIdQueryHandler>> _getEnvByIdLoggerMock;

    public DeploymentHandlerTests()
    {
        _bootstrapServiceMock = new Mock<IEnvironmentBootstrapService>();
        _bootstrapLoggerMock = new Mock<ILogger<BootstrapEnvironmentCommandHandler>>();
        _heartbeatLoggerMock = new Mock<ILogger<UpdateEnvironmentHeartbeatCommandHandler>>();
        _getEnvsLoggerMock = new Mock<ILogger<GetEnvironmentsQueryHandler>>();
        _getEnvByIdLoggerMock = new Mock<ILogger<GetEnvironmentByIdQueryHandler>>();
    }

    #region BootstrapEnvironmentCommandHandler Tests

    [Fact]
    public async Task BootstrapEnvironment_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new BootstrapEnvironmentCommandHandler(
            _bootstrapServiceMock.Object,
            _bootstrapLoggerMock.Object);

        var command = new BootstrapEnvironmentCommand
        {
            EnvironmentId = "env-001",
            Name = "Production",
            Type = EnvironmentType.Production,
            RegionId = "us-east-1",
            BaseUrl = "https://prod.example.com",
            LicenseKey = "license-key",
            DatabaseConnectionString = "connection-string",
            StorageEndpoint = "https://storage.example.com",
            SmtpHost = "smtp.example.com",
            SmtpPort = 587,
            ObservabilityEndpoint = "https://obs.example.com",
            FeaturesJson = "{}"
        };

        _bootstrapServiceMock
            .Setup(x => x.BootstrapAsync(It.IsAny<Onesign.Modules.Deployment.Domain.Entities.DeploymentDescriptor>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be("env-001");
    }

    [Fact]
    public async Task BootstrapEnvironment_WhenServiceThrowsException_ReturnsFailure()
    {
        // Arrange
        var handler = new BootstrapEnvironmentCommandHandler(
            _bootstrapServiceMock.Object,
            _bootstrapLoggerMock.Object);

        var command = new BootstrapEnvironmentCommand
        {
            EnvironmentId = "env-001",
            Name = "Production",
            Type = EnvironmentType.Production,
            RegionId = "us-east-1",
            BaseUrl = "https://prod.example.com"
        };

        _bootstrapServiceMock
            .Setup(x => x.BootstrapAsync(It.IsAny<Onesign.Modules.Deployment.Domain.Entities.DeploymentDescriptor>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Bootstrap failed"));

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("BOOTSTRAP_FAILED");
        result.ErrorMessage.Should().Contain("Bootstrap failed");
    }

    [Fact]
    public async Task BootstrapEnvironment_CallsServiceWithCorrectDescriptor()
    {
        // Arrange
        var handler = new BootstrapEnvironmentCommandHandler(
            _bootstrapServiceMock.Object,
            _bootstrapLoggerMock.Object);

        var command = new BootstrapEnvironmentCommand
        {
            EnvironmentId = "env-001",
            Name = "Production",
            Type = EnvironmentType.Production,
            RegionId = "us-east-1",
            BaseUrl = "https://prod.example.com",
            LicenseKey = "license-key",
            DatabaseConnectionString = "connection-string",
            StorageEndpoint = "https://storage.example.com",
            SmtpHost = "smtp.example.com",
            SmtpPort = 587,
            ObservabilityEndpoint = "https://obs.example.com",
            FeaturesJson = "{}"
        };

        _bootstrapServiceMock
            .Setup(x => x.BootstrapAsync(It.IsAny<Onesign.Modules.Deployment.Domain.Entities.DeploymentDescriptor>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        _bootstrapServiceMock.Verify(x => x.BootstrapAsync(
            It.Is<Onesign.Modules.Deployment.Domain.Entities.DeploymentDescriptor>(d =>
                d.EnvironmentId == "env-001" &&
                d.Name == "Production" &&
                d.Type == EnvironmentType.Production &&
                d.RegionId == "us-east-1" &&
                d.BaseUrl == "https://prod.example.com"),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task BootstrapEnvironment_LogsInformationOnSuccess()
    {
        // Arrange
        var handler = new BootstrapEnvironmentCommandHandler(
            _bootstrapServiceMock.Object,
            _bootstrapLoggerMock.Object);

        var command = new BootstrapEnvironmentCommand
        {
            EnvironmentId = "env-001",
            Name = "Test"
        };

        _bootstrapServiceMock
            .Setup(x => x.BootstrapAsync(It.IsAny<Onesign.Modules.Deployment.Domain.Entities.DeploymentDescriptor>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        _bootstrapLoggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.AtLeast(1));
    }

    #endregion

    #region UpdateEnvironmentHeartbeatCommandHandler Tests

    [Fact]
    public async Task UpdateEnvironmentHeartbeat_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new UpdateEnvironmentHeartbeatCommandHandler(_heartbeatLoggerMock.Object);

        var command = new UpdateEnvironmentHeartbeatCommand
        {
            EnvironmentId = "env-001",
            AppVersion = "1.0.0",
            DbSchemaVersion = "v1"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateEnvironmentHeartbeat_LogsInformation()
    {
        // Arrange
        var handler = new UpdateEnvironmentHeartbeatCommandHandler(_heartbeatLoggerMock.Object);

        var command = new UpdateEnvironmentHeartbeatCommand
        {
            EnvironmentId = "env-001"
        };

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        _heartbeatLoggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.AtLeast(1));
    }

    [Fact]
    public async Task UpdateEnvironmentHeartbeat_WithNullVersions_StillSucceeds()
    {
        // Arrange
        var handler = new UpdateEnvironmentHeartbeatCommandHandler(_heartbeatLoggerMock.Object);

        var command = new UpdateEnvironmentHeartbeatCommand
        {
            EnvironmentId = "env-001",
            AppVersion = null,
            DbSchemaVersion = null
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }

    #endregion

    #region GetEnvironmentsQueryHandler Tests

    [Fact]
    public async Task GetEnvironments_ReturnsEmptyList()
    {
        // Arrange
        var handler = new GetEnvironmentsQueryHandler(_getEnvsLoggerMock.Object);
        var query = new GetEnvironmentsQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task GetEnvironments_WithTypeFilter_LogsFilter()
    {
        // Arrange
        var handler = new GetEnvironmentsQueryHandler(_getEnvsLoggerMock.Object);
        var query = new GetEnvironmentsQuery
        {
            FilterByType = EnvironmentType.Production
        };

        // Act
        await handler.Handle(query, CancellationToken.None);

        // Assert
        _getEnvsLoggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task GetEnvironments_WithRegionFilter_LogsFilter()
    {
        // Arrange
        var handler = new GetEnvironmentsQueryHandler(_getEnvsLoggerMock.Object);
        var query = new GetEnvironmentsQuery
        {
            FilterByRegionId = "us-east-1"
        };

        // Act
        await handler.Handle(query, CancellationToken.None);

        // Assert
        _getEnvsLoggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region GetEnvironmentByIdQueryHandler Tests

    [Fact]
    public async Task GetEnvironmentById_ReturnsNotFound()
    {
        // Arrange
        var handler = new GetEnvironmentByIdQueryHandler(_getEnvByIdLoggerMock.Object);
        var query = new GetEnvironmentByIdQuery { EnvironmentId = "env-001" };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("ENVIRONMENT_NOT_FOUND");
    }

    [Fact]
    public async Task GetEnvironmentById_LogsInformation()
    {
        // Arrange
        var handler = new GetEnvironmentByIdQueryHandler(_getEnvByIdLoggerMock.Object);
        var query = new GetEnvironmentByIdQuery { EnvironmentId = "env-001" };

        // Act
        await handler.Handle(query, CancellationToken.None);

        // Assert
        _getEnvByIdLoggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion
}
