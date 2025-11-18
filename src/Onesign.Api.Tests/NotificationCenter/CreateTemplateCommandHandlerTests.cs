using FluentAssertions;
using Moq;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Application.Handlers;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.NotificationCenter;

public class CreateTemplateCommandHandlerTests
{
    private readonly Mock<INotificationTemplateRepository> _templateRepositoryMock;
    private readonly CreateTemplateCommandHandler _handler;

    public CreateTemplateCommandHandlerTests()
    {
        _templateRepositoryMock = new Mock<INotificationTemplateRepository>();
        _handler = new CreateTemplateCommandHandler(_templateRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccessWithTemplateDto()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateTemplateCommand
        {
            TenantId = tenantId,
            TemplateKey = "user.created",
            Name = "User Created Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Welcome {{UserName}}",
            BodyTemplate = "Hello {{UserName}}, welcome!"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Id.Should().NotBe(Guid.Empty);
        result.Value.TemplateKey.Should().Be("user.created");
        result.Value.Name.Should().Be("User Created Template");
        result.Value.Category.Should().Be("Account");
        result.Value.Channel.Should().Be("Email");
        result.Value.Locale.Should().Be("en");
        result.Value.SubjectTemplate.Should().Be("Welcome {{UserName}}");
        result.Value.BodyTemplate.Should().Be("Hello {{UserName}}, welcome!");
        result.Value.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_InvalidCategory_ReturnsFailure()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "user.created",
            Name = "User Created Template",
            Category = "InvalidCategory",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("Invalid category");
        _templateRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_InvalidChannel_ReturnsFailure()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "user.created",
            Name = "User Created Template",
            Category = "Account",
            Channel = "InvalidChannel",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("Invalid channel");
        _templateRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData("Security", TemplateCategory.Security)]
    [InlineData("security", TemplateCategory.Security)]
    [InlineData("Account", TemplateCategory.Account)]
    [InlineData("account", TemplateCategory.Account)]
    [InlineData("Governance", TemplateCategory.Governance)]
    [InlineData("governance", TemplateCategory.Governance)]
    [InlineData("AccessRequest", TemplateCategory.AccessRequest)]
    [InlineData("accessrequest", TemplateCategory.AccessRequest)]
    [InlineData("Lifecycle", TemplateCategory.Lifecycle)]
    [InlineData("lifecycle", TemplateCategory.Lifecycle)]
    [InlineData("System", TemplateCategory.System)]
    [InlineData("system", TemplateCategory.System)]
    public async Task Handle_AllValidCategories_SetsCorrectCategory(string categoryInput, TemplateCategory expectedCategory)
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = categoryInput,
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.Category.Should().Be(expectedCategory);
        result.Value!.Category.Should().Be(expectedCategory.ToString());
    }

    [Theory]
    [InlineData("Email", NotificationChannel.Email)]
    [InlineData("email", NotificationChannel.Email)]
    [InlineData("Sms", NotificationChannel.Sms)]
    [InlineData("sms", NotificationChannel.Sms)]
    [InlineData("InApp", NotificationChannel.InApp)]
    [InlineData("inapp", NotificationChannel.InApp)]
    [InlineData("Webhook", NotificationChannel.Webhook)]
    [InlineData("webhook", NotificationChannel.Webhook)]
    public async Task Handle_AllValidChannels_SetsCorrectChannel(string channelInput, NotificationChannel expectedChannel)
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = channelInput,
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.Channel.Should().Be(expectedChannel);
        result.Value!.Channel.Should().Be(expectedChannel.ToString());
    }

    [Fact]
    public async Task Handle_SetsTenantIdCorrectly()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateTemplateCommand
        {
            TenantId = tenantId,
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.TenantId.Should().Be(tenantId);
    }

    [Fact]
    public async Task Handle_SetsTemplateKeyCorrectly()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "user.password.reset",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.TemplateKey.Should().Be("user.password.reset");
    }

    [Fact]
    public async Task Handle_SetsNameCorrectly()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "My Custom Template Name",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.Name.Should().Be("My Custom Template Name");
    }

    [Fact]
    public async Task Handle_SetsLocaleCorrectly()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "fa",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.Locale.Should().Be("fa");
        result.Value!.Locale.Should().Be("fa");
    }

    [Fact]
    public async Task Handle_SetsSubjectTemplateCorrectly()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Welcome {{FirstName}} {{LastName}}",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.SubjectTemplate.Should().Be("Welcome {{FirstName}} {{LastName}}");
        result.Value!.SubjectTemplate.Should().Be("Welcome {{FirstName}} {{LastName}}");
    }

    [Fact]
    public async Task Handle_SetsBodyTemplateCorrectly()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "<html><body>Hello {{UserName}}</body></html>"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.BodyTemplate.Should().Be("<html><body>Hello {{UserName}}</body></html>");
        result.Value!.BodyTemplate.Should().Be("<html><body>Hello {{UserName}}</body></html>");
    }

    [Fact]
    public async Task Handle_SetsIsEnabledToTrue()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.IsEnabled.Should().BeTrue();
        result.Value!.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_SetsCreatedAtToCurrentTime()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        var beforeCreate = DateTime.UtcNow;

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        var afterCreate = DateTime.UtcNow;

        // Assert
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.CreatedAt.Should().BeOnOrAfter(beforeCreate);
        capturedTemplate.CreatedAt.Should().BeOnOrBefore(afterCreate);
    }

    [Fact]
    public async Task Handle_GeneratesUniqueId()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.Id.Should().NotBe(Guid.Empty);
        result.Value!.Id.Should().Be(capturedTemplate.Id);
    }

    [Fact]
    public async Task Handle_CallsRepositoryAddAsync()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _templateRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PassesCancellationToken()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        var cancellationToken = new CancellationToken();

        // Act
        await _handler.Handle(command, cancellationToken);

        // Assert
        _templateRepositoryMock.Verify(r => r.AddAsync(It.IsAny<NotificationTemplate>(), cancellationToken), Times.Once);
    }

    [Fact]
    public async Task Handle_EmptyTemplateKey_CreatesTemplate()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.TemplateKey.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_EmptyName_CreatesTemplate()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.Name.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_EmptySubjectTemplate_CreatesTemplate()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "",
            BodyTemplate = "Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.SubjectTemplate.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_EmptyBodyTemplate_CreatesTemplate()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = ""
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.BodyTemplate.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_LongTemplateContent_CreatesTemplate()
    {
        // Arrange
        var longSubject = new string('A', 1000);
        var longBody = new string('B', 50000);

        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = longSubject,
            BodyTemplate = longBody
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.SubjectTemplate.Should().Be(longSubject);
        capturedTemplate.BodyTemplate.Should().Be(longBody);
    }

    [Fact]
    public async Task Handle_SpecialCharactersInContent_CreatesTemplate()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test <Template> & \"Special\"",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject with {{variable}} & <tags>",
            BodyTemplate = "<html><body>{{content}} & special chars</body></html>"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.Name.Should().Be("Test <Template> & \"Special\"");
        capturedTemplate.SubjectTemplate.Should().Be("Subject with {{variable}} & <tags>");
        capturedTemplate.BodyTemplate.Should().Be("<html><body>{{content}} & special chars</body></html>");
    }

    [Fact]
    public async Task Handle_MultipleCalls_GeneratesUniqueIds()
    {
        // Arrange
        var ids = new List<Guid>();

        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => ids.Add(template.Id))
            .Returns(Task.CompletedTask);

        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "test.template",
            Name = "Test Template",
            Category = "Account",
            Channel = "Email",
            Locale = "en",
            SubjectTemplate = "Subject",
            BodyTemplate = "Body"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);
        await _handler.Handle(command, CancellationToken.None);
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        ids.Should().HaveCount(3);
        ids.Should().OnlyHaveUniqueItems();
    }

    [Fact]
    public async Task Handle_SmsChannel_CreatesTemplate()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "sms.verification",
            Name = "SMS Verification",
            Category = "Security",
            Channel = "Sms",
            Locale = "en",
            SubjectTemplate = "",
            BodyTemplate = "Your verification code is {{Code}}"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.Channel.Should().Be(NotificationChannel.Sms);
    }

    [Fact]
    public async Task Handle_WebhookChannel_CreatesTemplate()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "webhook.event",
            Name = "Webhook Event",
            Category = "System",
            Channel = "Webhook",
            Locale = "en",
            SubjectTemplate = "Event: {{EventType}}",
            BodyTemplate = "{\"event\": \"{{EventType}}\", \"data\": {{Data}}}"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.Channel.Should().Be(NotificationChannel.Webhook);
    }

    [Fact]
    public async Task Handle_InAppChannel_CreatesTemplate()
    {
        // Arrange
        var command = new CreateTemplateCommand
        {
            TenantId = Guid.NewGuid(),
            TemplateKey = "inapp.notification",
            Name = "In-App Notification",
            Category = "Lifecycle",
            Channel = "InApp",
            Locale = "en",
            SubjectTemplate = "New Message",
            BodyTemplate = "You have a new message from {{SenderName}}"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedTemplate.Should().NotBeNull();
        capturedTemplate!.Channel.Should().Be(NotificationChannel.InApp);
    }

    [Fact]
    public async Task Handle_ReturnsDtoWithCorrectMapping()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var command = new CreateTemplateCommand
        {
            TenantId = tenantId,
            TemplateKey = "test.key",
            Name = "Test Name",
            Category = "Security",
            Channel = "Sms",
            Locale = "fa",
            SubjectTemplate = "Test Subject",
            BodyTemplate = "Test Body"
        };

        NotificationTemplate? capturedTemplate = null;
        _templateRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<NotificationTemplate>(), It.IsAny<CancellationToken>()))
            .Callback<NotificationTemplate, CancellationToken>((template, _) => capturedTemplate = template)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();

        // Verify DTO matches captured entity
        result.Value!.Id.Should().Be(capturedTemplate!.Id);
        result.Value.TemplateKey.Should().Be(capturedTemplate.TemplateKey);
        result.Value.Name.Should().Be(capturedTemplate.Name);
        result.Value.Category.Should().Be(capturedTemplate.Category.ToString());
        result.Value.Channel.Should().Be(capturedTemplate.Channel.ToString());
        result.Value.Locale.Should().Be(capturedTemplate.Locale);
        result.Value.SubjectTemplate.Should().Be(capturedTemplate.SubjectTemplate);
        result.Value.BodyTemplate.Should().Be(capturedTemplate.BodyTemplate);
        result.Value.IsEnabled.Should().Be(capturedTemplate.IsEnabled);
    }
}
