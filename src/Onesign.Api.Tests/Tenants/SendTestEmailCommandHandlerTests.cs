using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Tenants.Application.Commands;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Email;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class SendTestEmailCommandHandlerTests
{
    private readonly Mock<IEmailTemplateRepository> _templateRepositoryMock = new();
    private readonly Mock<ITenantConfigRepository> _tenantConfigRepositoryMock = new();
    private readonly Mock<IEmailService> _emailServiceMock = new();
    private readonly Mock<ILogger<SendTestEmailCommandHandler>> _loggerMock = new();

    private SendTestEmailCommandHandler CreateHandler() =>
        new(
            _templateRepositoryMock.Object,
            _tenantConfigRepositoryMock.Object,
            _emailServiceMock.Object,
            _loggerMock.Object);

    [Fact]
    public async Task Handle_ValidRequest_SendsHtmlEmailWithReplacedVariables()
    {
        var tenantId = Guid.NewGuid();
        var template = new EmailTemplate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Type = "password_reset",
            Subject = "Reset for {{user.name}}",
            HtmlBody = "<p>Hello {{user.name}} from {{company.name}}</p>",
            Body = "Hello {{user.name}}",
            IsEnabled = true,
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTypeAsync(tenantId, "password_reset", It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        _tenantConfigRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TenantConfig { TenantId = tenantId, TenantName = "Acme Corp" });

        _emailServiceMock
            .Setup(e => e.SendEmailAsync(
                "admin@acme.com",
                "Test User",
                "[TEST] Reset for Test User",
                "<p>Hello Test User from Acme Corp</p>",
                true,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var handler = CreateHandler();
        var result = await handler.Handle(
            new SendTestEmailCommand
            {
                TenantId = tenantId,
                Email = "admin@acme.com",
                Type = "password_reset",
            },
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _emailServiceMock.Verify(
            e => e.SendEmailAsync(
                "admin@acme.com",
                "Test User",
                "[TEST] Reset for Test User",
                "<p>Hello Test User from Acme Corp</p>",
                true,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_EmailServiceFails_ReturnsFailure()
    {
        var tenantId = Guid.NewGuid();
        _templateRepositoryMock
            .Setup(r => r.GetByTypeAsync(tenantId, "welcome", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmailTemplate
            {
                TenantId = tenantId,
                Type = "welcome",
                Subject = "Welcome",
                Body = "Hi",
                IsEnabled = true,
            });

        _emailServiceMock
            .Setup(e => e.SendEmailAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<bool>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await CreateHandler().Handle(
            new SendTestEmailCommand { TenantId = tenantId, Email = "a@b.com", Type = "welcome" },
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("EMAIL_SEND_FAILED");
    }

    [Fact]
    public async Task Handle_InvalidEmail_ReturnsFailure()
    {
        var result = await CreateHandler().Handle(
            new SendTestEmailCommand { TenantId = Guid.NewGuid(), Email = "not-an-email", Type = "welcome" },
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("INVALID_EMAIL");
        _emailServiceMock.Verify(
            e => e.SendEmailAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<bool>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
