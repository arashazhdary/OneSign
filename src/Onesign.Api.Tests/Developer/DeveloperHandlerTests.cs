using FluentAssertions;
using Moq;
using Onesign.Modules.Developer.Application.Commands;
using Onesign.Modules.Developer.Application.Queries;
using Onesign.Modules.Developer.Domain.Entities;
using Onesign.Modules.Developer.Domain.Enums;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Modules.Developer.Domain.Services;

namespace Onesign.Api.Tests.Developer;

public class DeveloperHandlerTests
{
    private readonly Mock<IApiKeyRepository> _apiKeyRepositoryMock;
    private readonly Mock<IApiKeyService> _apiKeyServiceMock;
    private readonly Mock<IServiceAccountRepository> _serviceAccountRepositoryMock;

    public DeveloperHandlerTests()
    {
        _apiKeyRepositoryMock = new Mock<IApiKeyRepository>();
        _apiKeyServiceMock = new Mock<IApiKeyService>();
        _serviceAccountRepositoryMock = new Mock<IServiceAccountRepository>();
    }

    #region CreateApiKeyCommandHandler Tests

    [Fact]
    public async Task CreateApiKey_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new CreateApiKeyCommandHandler(
            _apiKeyRepositoryMock.Object,
            _apiKeyServiceMock.Object);

        var command = new CreateApiKeyCommand
        {
            TenantId = Guid.NewGuid(),
            ServiceAccountId = Guid.NewGuid(),
            Name = "Test API Key",
            Description = "Test Description",
            Scopes = new List<string> { "read", "write" },
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        var plainTextKey = "os_test_1234567890";
        var keyHash = "hashed_key";
        var keyPrefix = "os_test";

        _apiKeyServiceMock.Setup(x => x.GenerateApiKey()).Returns(plainTextKey);
        _apiKeyServiceMock.Setup(x => x.HashApiKey(plainTextKey)).Returns(keyHash);
        _apiKeyServiceMock.Setup(x => x.GetKeyPrefix(plainTextKey)).Returns(keyPrefix);

        _apiKeyRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<ApiKey>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ApiKey key, CancellationToken ct) => key);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.PlainTextKey.Should().Be(plainTextKey);
        result.Value.KeyPrefix.Should().Be(keyPrefix);
    }

    [Fact]
    public async Task CreateApiKey_WithEmptyName_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateApiKeyCommandHandler(
            _apiKeyRepositoryMock.Object,
            _apiKeyServiceMock.Object);

        var command = new CreateApiKeyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "",
            Description = "Test"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorMessage.Should().Contain("name is required");
    }

    [Fact]
    public async Task CreateApiKey_WithWhitespaceName_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateApiKeyCommandHandler(
            _apiKeyRepositoryMock.Object,
            _apiKeyServiceMock.Object);

        var command = new CreateApiKeyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "   ",
            Description = "Test"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
    }

    [Fact]
    public async Task CreateApiKey_TrimsNameAndDescription()
    {
        // Arrange
        var handler = new CreateApiKeyCommandHandler(
            _apiKeyRepositoryMock.Object,
            _apiKeyServiceMock.Object);

        var command = new CreateApiKeyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "  Test Key  ",
            Description = "  Test Description  "
        };

        _apiKeyServiceMock.Setup(x => x.GenerateApiKey()).Returns("key");
        _apiKeyServiceMock.Setup(x => x.HashApiKey(It.IsAny<string>())).Returns("hash");
        _apiKeyServiceMock.Setup(x => x.GetKeyPrefix(It.IsAny<string>())).Returns("prefix");

        ApiKey? savedKey = null;
        _apiKeyRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<ApiKey>(), It.IsAny<CancellationToken>()))
            .Callback<ApiKey, CancellationToken>((key, ct) => savedKey = key)
            .ReturnsAsync((ApiKey key, CancellationToken ct) => key);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        savedKey.Should().NotBeNull();
        savedKey!.Name.Should().Be("Test Key");
        savedKey.Description.Should().Be("Test Description");
    }

    [Fact]
    public async Task CreateApiKey_SetsCorrectStatus()
    {
        // Arrange
        var handler = new CreateApiKeyCommandHandler(
            _apiKeyRepositoryMock.Object,
            _apiKeyServiceMock.Object);

        var command = new CreateApiKeyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Key"
        };

        _apiKeyServiceMock.Setup(x => x.GenerateApiKey()).Returns("key");
        _apiKeyServiceMock.Setup(x => x.HashApiKey(It.IsAny<string>())).Returns("hash");
        _apiKeyServiceMock.Setup(x => x.GetKeyPrefix(It.IsAny<string>())).Returns("prefix");

        ApiKey? savedKey = null;
        _apiKeyRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<ApiKey>(), It.IsAny<CancellationToken>()))
            .Callback<ApiKey, CancellationToken>((key, ct) => savedKey = key)
            .ReturnsAsync((ApiKey key, CancellationToken ct) => key);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        savedKey!.Status.Should().Be(ApiKeyStatus.Active);
    }

    #endregion

    #region RevokeApiKeyCommandHandler Tests

    [Fact]
    public async Task RevokeApiKey_WithExistingKey_ReturnsSuccess()
    {
        // Arrange
        var handler = new RevokeApiKeyCommandHandler(_apiKeyRepositoryMock.Object);

        var apiKeyId = Guid.NewGuid();
        var apiKey = new ApiKey
        {
            Id = apiKeyId,
            Name = "Test",
            Status = ApiKeyStatus.Active
        };

        var command = new RevokeApiKeyCommand
        {
            Id = apiKeyId,
            Reason = "Security breach"
        };

        _apiKeyRepositoryMock
            .Setup(x => x.GetByIdAsync(apiKeyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apiKey);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        apiKey.Status.Should().Be(ApiKeyStatus.Revoked);
        apiKey.RevokedReason.Should().Be("Security breach");
        apiKey.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task RevokeApiKey_WithNonExistingKey_ReturnsFailure()
    {
        // Arrange
        var handler = new RevokeApiKeyCommandHandler(_apiKeyRepositoryMock.Object);

        var command = new RevokeApiKeyCommand { Id = Guid.NewGuid() };

        _apiKeyRepositoryMock
            .Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ApiKey?)null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorMessage.Should().Contain("not found");
    }

    [Fact]
    public async Task RevokeApiKey_WithAlreadyRevokedKey_ReturnsFailure()
    {
        // Arrange
        var handler = new RevokeApiKeyCommandHandler(_apiKeyRepositoryMock.Object);

        var apiKeyId = Guid.NewGuid();
        var apiKey = new ApiKey
        {
            Id = apiKeyId,
            Name = "Test",
            Status = ApiKeyStatus.Revoked
        };

        var command = new RevokeApiKeyCommand { Id = apiKeyId };

        _apiKeyRepositoryMock
            .Setup(x => x.GetByIdAsync(apiKeyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apiKey);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorMessage.Should().Contain("already revoked");
    }

    [Fact]
    public async Task RevokeApiKey_UpdatesRepository()
    {
        // Arrange
        var handler = new RevokeApiKeyCommandHandler(_apiKeyRepositoryMock.Object);

        var apiKeyId = Guid.NewGuid();
        var apiKey = new ApiKey
        {
            Id = apiKeyId,
            Name = "Test",
            Status = ApiKeyStatus.Active
        };

        var command = new RevokeApiKeyCommand { Id = apiKeyId };

        _apiKeyRepositoryMock
            .Setup(x => x.GetByIdAsync(apiKeyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apiKey);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        _apiKeyRepositoryMock.Verify(
            x => x.UpdateAsync(apiKey, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region CreateServiceAccountCommandHandler Tests

    [Fact]
    public async Task CreateServiceAccount_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new CreateServiceAccountCommandHandler(_serviceAccountRepositoryMock.Object);

        var command = new CreateServiceAccountCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test Service Account",
            Description = "Test Description",
            Email = "test@example.com",
            Roles = new List<string> { "admin" },
            CreatedByUserId = Guid.NewGuid()
        };

        _serviceAccountRepositoryMock
            .Setup(x => x.GetByEmailAsync(command.TenantId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServiceAccount?)null);

        _serviceAccountRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<ServiceAccount>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServiceAccount sa, CancellationToken ct) => sa);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("Test Service Account");
        result.Value.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task CreateServiceAccount_WithEmptyName_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateServiceAccountCommandHandler(_serviceAccountRepositoryMock.Object);

        var command = new CreateServiceAccountCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "",
            Email = "test@example.com"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorMessage.Should().Contain("name is required");
    }

    [Fact]
    public async Task CreateServiceAccount_WithEmptyEmail_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateServiceAccountCommandHandler(_serviceAccountRepositoryMock.Object);

        var command = new CreateServiceAccountCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test",
            Email = ""
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorMessage.Should().Contain("Email is required");
    }

    [Fact]
    public async Task CreateServiceAccount_WithDuplicateEmail_ReturnsFailure()
    {
        // Arrange
        var handler = new CreateServiceAccountCommandHandler(_serviceAccountRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var command = new CreateServiceAccountCommand
        {
            TenantId = tenantId,
            Name = "Test",
            Email = "test@example.com"
        };

        _serviceAccountRepositoryMock
            .Setup(x => x.GetByEmailAsync(tenantId, "test@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ServiceAccount { Id = Guid.NewGuid() });

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorMessage.Should().Contain("already exists");
    }

    [Fact]
    public async Task CreateServiceAccount_NormalizesEmail()
    {
        // Arrange
        var handler = new CreateServiceAccountCommandHandler(_serviceAccountRepositoryMock.Object);

        var command = new CreateServiceAccountCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Test",
            Email = "  TEST@EXAMPLE.COM  "
        };

        _serviceAccountRepositoryMock
            .Setup(x => x.GetByEmailAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServiceAccount?)null);

        ServiceAccount? savedAccount = null;
        _serviceAccountRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<ServiceAccount>(), It.IsAny<CancellationToken>()))
            .Callback<ServiceAccount, CancellationToken>((sa, ct) => savedAccount = sa)
            .ReturnsAsync((ServiceAccount sa, CancellationToken ct) => sa);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        savedAccount!.Email.Should().Be("test@example.com");
    }

    #endregion

    #region GetApiKeysQueryHandler Tests

    [Fact]
    public async Task GetApiKeys_WithTenantId_ReturnsApiKeys()
    {
        // Arrange
        var handler = new GetApiKeysQueryHandler(_apiKeyRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var apiKeys = new List<ApiKey>
        {
            new ApiKey { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Key 1", Status = ApiKeyStatus.Active },
            new ApiKey { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Key 2", Status = ApiKeyStatus.Revoked }
        };

        var query = new GetApiKeysQuery { TenantId = tenantId };

        _apiKeyRepositoryMock
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apiKeys);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetApiKeys_WithServiceAccountId_ReturnsFilteredApiKeys()
    {
        // Arrange
        var handler = new GetApiKeysQueryHandler(_apiKeyRepositoryMock.Object);

        var serviceAccountId = Guid.NewGuid();
        var apiKeys = new List<ApiKey>
        {
            new ApiKey { Id = Guid.NewGuid(), ServiceAccountId = serviceAccountId, Name = "Key 1" }
        };

        var query = new GetApiKeysQuery
        {
            TenantId = Guid.NewGuid(),
            ServiceAccountId = serviceAccountId
        };

        _apiKeyRepositoryMock
            .Setup(x => x.GetByServiceAccountIdAsync(serviceAccountId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(apiKeys);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
    }

    #endregion

    #region GetServiceAccountsQueryHandler Tests

    [Fact]
    public async Task GetServiceAccounts_ReturnsServiceAccounts()
    {
        // Arrange
        var handler = new GetServiceAccountsQueryHandler(_serviceAccountRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var accounts = new List<ServiceAccount>
        {
            new ServiceAccount { Id = Guid.NewGuid(), TenantId = tenantId, Name = "SA 1", Email = "sa1@test.com", Status = ServiceAccountStatus.Active },
            new ServiceAccount { Id = Guid.NewGuid(), TenantId = tenantId, Name = "SA 2", Email = "sa2@test.com", Status = ServiceAccountStatus.Suspended }
        };

        var query = new GetServiceAccountsQuery { TenantId = tenantId };

        _serviceAccountRepositoryMock
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(accounts);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetServiceAccounts_MapsFieldsCorrectly()
    {
        // Arrange
        var handler = new GetServiceAccountsQueryHandler(_serviceAccountRepositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var accounts = new List<ServiceAccount>
        {
            new ServiceAccount
            {
                Id = accountId,
                TenantId = tenantId,
                Name = "Test Account",
                Description = "Description",
                Email = "test@example.com",
                Status = ServiceAccountStatus.Active,
                Roles = new List<string> { "admin" },
                CreatedAt = DateTime.UtcNow,
                ApiKeys = new List<ApiKey> { new ApiKey() }
            }
        };

        var query = new GetServiceAccountsQuery { TenantId = tenantId };

        _serviceAccountRepositoryMock
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(accounts);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var dto = result.Value![0];
        dto.Id.Should().Be(accountId);
        dto.Name.Should().Be("Test Account");
        dto.Email.Should().Be("test@example.com");
        dto.Status.Should().Be(ServiceAccountStatus.Active);
        dto.ApiKeyCount.Should().Be(1);
    }

    #endregion
}
