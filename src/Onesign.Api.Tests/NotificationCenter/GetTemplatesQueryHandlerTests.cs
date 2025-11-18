using FluentAssertions;
using Moq;
using Onesign.Modules.NotificationCenter.Application.Handlers;
using Onesign.Modules.NotificationCenter.Application.Queries;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.NotificationCenter;

public class GetTemplatesQueryHandlerTests
{
    private readonly Mock<INotificationTemplateRepository> _templateRepositoryMock;
    private readonly GetTemplatesQueryHandler _handler;

    public GetTemplatesQueryHandlerTests()
    {
        _templateRepositoryMock = new Mock<INotificationTemplateRepository>();
        _handler = new GetTemplatesQueryHandler(_templateRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WithTemplates_ReturnsSuccessWithDtos()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "user.created",
                Name = "User Created",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Welcome",
                BodyTemplate = "Hello",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "password.reset",
                Name = "Password Reset",
                Category = TemplateCategory.Security,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Reset Password",
                BodyTemplate = "Click here",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_NoTemplates_ReturnsEmptyList()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationTemplate>());

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_MapsIdCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var templateId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = templateId,
                TenantId = tenantId,
                TemplateKey = "test",
                Name = "Test",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Subject",
                BodyTemplate = "Body",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value.Should().ContainSingle();
        result.Value![0].Id.Should().Be(templateId);
    }

    [Fact]
    public async Task Handle_MapsTemplateKeyCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "user.password.reset",
                Name = "Test",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Subject",
                BodyTemplate = "Body",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].TemplateKey.Should().Be("user.password.reset");
    }

    [Fact]
    public async Task Handle_MapsNameCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "test",
                Name = "My Custom Template",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Subject",
                BodyTemplate = "Body",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].Name.Should().Be("My Custom Template");
    }

    [Theory]
    [InlineData(TemplateCategory.Security, "Security")]
    [InlineData(TemplateCategory.Account, "Account")]
    [InlineData(TemplateCategory.Governance, "Governance")]
    [InlineData(TemplateCategory.AccessRequest, "AccessRequest")]
    [InlineData(TemplateCategory.Lifecycle, "Lifecycle")]
    [InlineData(TemplateCategory.System, "System")]
    public async Task Handle_MapsCategoryCorrectly(TemplateCategory category, string expectedCategoryString)
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "test",
                Name = "Test",
                Category = category,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Subject",
                BodyTemplate = "Body",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].Category.Should().Be(expectedCategoryString);
    }

    [Theory]
    [InlineData(NotificationChannel.Email, "Email")]
    [InlineData(NotificationChannel.Sms, "Sms")]
    [InlineData(NotificationChannel.InApp, "InApp")]
    [InlineData(NotificationChannel.Webhook, "Webhook")]
    public async Task Handle_MapsChannelCorrectly(NotificationChannel channel, string expectedChannelString)
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "test",
                Name = "Test",
                Category = TemplateCategory.Account,
                Channel = channel,
                Locale = "en",
                SubjectTemplate = "Subject",
                BodyTemplate = "Body",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].Channel.Should().Be(expectedChannelString);
    }

    [Fact]
    public async Task Handle_MapsLocaleCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "test",
                Name = "Test",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Email,
                Locale = "fa",
                SubjectTemplate = "Subject",
                BodyTemplate = "Body",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].Locale.Should().Be("fa");
    }

    [Fact]
    public async Task Handle_MapsSubjectTemplateCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "test",
                Name = "Test",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Welcome {{UserName}}",
                BodyTemplate = "Body",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].SubjectTemplate.Should().Be("Welcome {{UserName}}");
    }

    [Fact]
    public async Task Handle_MapsBodyTemplateCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "test",
                Name = "Test",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Subject",
                BodyTemplate = "<html><body>Hello {{UserName}}</body></html>",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].BodyTemplate.Should().Be("<html><body>Hello {{UserName}}</body></html>");
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Handle_MapsIsEnabledCorrectly(bool isEnabled)
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "test",
                Name = "Test",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Subject",
                BodyTemplate = "Body",
                IsEnabled = isEnabled,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Value![0].IsEnabled.Should().Be(isEnabled);
    }

    [Fact]
    public async Task Handle_CallsRepositoryWithCorrectTenantId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<NotificationTemplate>());

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _templateRepositoryMock.Verify(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PassesCancellationToken()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var cancellationToken = new CancellationToken();

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, cancellationToken))
            .ReturnsAsync(new List<NotificationTemplate>());

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        await _handler.Handle(query, cancellationToken);

        // Assert
        _templateRepositoryMock.Verify(r => r.GetByTenantIdAsync(tenantId, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task Handle_MultipleTemplates_MapsAllCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "template1",
                Name = "Template 1",
                Category = TemplateCategory.Security,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Subject 1",
                BodyTemplate = "Body 1",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "template2",
                Name = "Template 2",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Sms,
                Locale = "fa",
                SubjectTemplate = "Subject 2",
                BodyTemplate = "Body 2",
                IsEnabled = false,
                CreatedAt = DateTime.UtcNow
            },
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "template3",
                Name = "Template 3",
                Category = TemplateCategory.Governance,
                Channel = NotificationChannel.InApp,
                Locale = "en",
                SubjectTemplate = "Subject 3",
                BodyTemplate = "Body 3",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(3);

        result.Value![0].TemplateKey.Should().Be("template1");
        result.Value[0].Name.Should().Be("Template 1");
        result.Value[0].Category.Should().Be("Security");
        result.Value[0].Channel.Should().Be("Email");

        result.Value[1].TemplateKey.Should().Be("template2");
        result.Value[1].Name.Should().Be("Template 2");
        result.Value[1].Category.Should().Be("Account");
        result.Value[1].Channel.Should().Be("Sms");
        result.Value[1].Locale.Should().Be("fa");
        result.Value[1].IsEnabled.Should().BeFalse();

        result.Value[2].TemplateKey.Should().Be("template3");
        result.Value[2].Name.Should().Be("Template 3");
        result.Value[2].Category.Should().Be("Governance");
        result.Value[2].Channel.Should().Be("InApp");
    }

    [Fact]
    public async Task Handle_EmptyStrings_MapsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "",
                Name = "",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Email,
                Locale = "",
                SubjectTemplate = "",
                BodyTemplate = "",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].TemplateKey.Should().BeEmpty();
        result.Value[0].Name.Should().BeEmpty();
        result.Value[0].Locale.Should().BeEmpty();
        result.Value[0].SubjectTemplate.Should().BeEmpty();
        result.Value[0].BodyTemplate.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_LargeNumberOfTemplates_ReturnsAll()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var templates = Enumerable.Range(0, 100).Select(i => new NotificationTemplate
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            TemplateKey = $"template{i}",
            Name = $"Template {i}",
            Category = TemplateCategory.Account,
            Channel = NotificationChannel.Email,
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body",
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(100);
    }

    [Fact]
    public async Task Handle_SpecialCharactersInContent_MapsCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var templates = new List<NotificationTemplate>
        {
            new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TemplateKey = "test.key",
                Name = "Test <Template> & \"Special\"",
                Category = TemplateCategory.Account,
                Channel = NotificationChannel.Email,
                Locale = "en",
                SubjectTemplate = "Subject with {{variable}} & <tags>",
                BodyTemplate = "<html><body>{{content}} & special chars</body></html>",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _templateRepositoryMock
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery { TenantId = tenantId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value![0].Name.Should().Be("Test <Template> & \"Special\"");
        result.Value[0].SubjectTemplate.Should().Be("Subject with {{variable}} & <tags>");
        result.Value[0].BodyTemplate.Should().Be("<html><body>{{content}} & special chars</body></html>");
    }
}
