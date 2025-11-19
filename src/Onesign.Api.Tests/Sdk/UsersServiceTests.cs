using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Moq;
using Moq.Protected;
using Onesign.Sdk.DotNet;
using Onesign.Sdk.DotNet.Models;
using Onesign.Sdk.DotNet.Services;
using Xunit;

namespace Onesign.Api.Tests.Sdk;

public class UsersServiceTests
{
    private readonly Mock<HttpMessageHandler> _mockHandler;
    private readonly HttpClient _httpClient;
    private readonly Mock<AuthService> _mockAuthService;
    private readonly UsersService _usersService;

    public UsersServiceTests()
    {
        _mockHandler = new Mock<HttpMessageHandler>();
        _httpClient = new HttpClient(_mockHandler.Object)
        {
            BaseAddress = new Uri("https://auth.example.com")
        };

        var options = new OnesignOptions
        {
            BaseUrl = "https://auth.example.com",
            ClientId = "test-client",
            ClientSecret = "test-secret"
        };

        _mockAuthService = new Mock<AuthService>(_httpClient, options);
        _mockAuthService.Setup(x => x.GetAccessTokenAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("test-access-token");

        _usersService = new UsersService(_httpClient, _mockAuthService.Object);
    }

    [Fact]
    public async Task GetUserAsync_Success_ReturnsUser()
    {
        // Arrange
        var user = new User
        {
            Id = "user-123",
            Email = "test@example.com",
            Username = "testuser",
            FirstName = "Test",
            LastName = "User"
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(user));

        // Act
        var result = await _usersService.GetUserAsync("user-123");

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be("user-123");
        result.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task GetUserAsync_NotFound_ThrowsOnesignException()
    {
        // Arrange
        var errorResponse = new ErrorResponse
        {
            Error = "not_found",
            ErrorDescription = "User not found"
        };

        SetupMockResponse(HttpStatusCode.NotFound, JsonSerializer.Serialize(errorResponse));

        // Act & Assert
        var act = () => _usersService.GetUserAsync("nonexistent");
        await act.Should().ThrowAsync<OnesignException>()
            .Where(e => e.StatusCode == HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetUserAsync_SetsAuthorizationHeader()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new User { Id = "user-123" }), req => capturedRequest = req);

        // Act
        await _usersService.GetUserAsync("user-123");

        // Assert
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Headers.Authorization.Should().NotBeNull();
        capturedRequest.Headers.Authorization!.Scheme.Should().Be("Bearer");
        capturedRequest.Headers.Authorization.Parameter.Should().Be("test-access-token");
    }

    [Fact]
    public async Task GetUserByEmailAsync_Success_ReturnsUser()
    {
        // Arrange
        var user = new User
        {
            Id = "user-456",
            Email = "test@example.com"
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(user));

        // Act
        var result = await _usersService.GetUserByEmailAsync("test@example.com");

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task GetUserByEmailAsync_EncodesEmail()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new User { Id = "user-123" }), req => capturedRequest = req);

        // Act
        await _usersService.GetUserByEmailAsync("test+special@example.com");

        // Assert
        capturedRequest!.RequestUri!.AbsoluteUri.Should().Contain("test%2Bspecial%40example.com");
    }

    [Fact]
    public async Task CreateUserAsync_Success_ReturnsCreatedUser()
    {
        // Arrange
        var request = new CreateUserRequest
        {
            Email = "new@example.com",
            Password = "SecurePassword123!",
            FirstName = "New",
            LastName = "User"
        };

        var createdUser = new User
        {
            Id = "new-user-id",
            Email = "new@example.com",
            FirstName = "New",
            LastName = "User"
        };

        SetupMockResponse(HttpStatusCode.Created, JsonSerializer.Serialize(createdUser));

        // Act
        var result = await _usersService.CreateUserAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be("new-user-id");
        result.Email.Should().Be("new@example.com");
    }

    [Fact]
    public async Task CreateUserAsync_SendsCorrectPayload()
    {
        // Arrange
        var request = new CreateUserRequest
        {
            Email = "new@example.com",
            Password = "Password123!",
            FirstName = "Test",
            Roles = new List<string> { "admin", "user" }
        };

        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.Created, JsonSerializer.Serialize(new User { Id = "new-id" }), req => capturedRequest = req);

        // Act
        await _usersService.CreateUserAsync(request);

        // Assert
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Method.Should().Be(HttpMethod.Post);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/users");

        var content = await capturedRequest.Content!.ReadAsStringAsync();
        content.Should().Contain("new@example.com");
    }

    [Fact]
    public async Task CreateUserAsync_ValidationError_ThrowsWithValidationErrors()
    {
        // Arrange
        var request = new CreateUserRequest
        {
            Email = "invalid",
            Password = "weak"
        };

        var errorResponse = new ErrorResponse
        {
            Error = "validation_error",
            ErrorDescription = "Validation failed",
            ValidationErrors = new Dictionary<string, string[]>
            {
                { "Email", new[] { "Invalid email format" } },
                { "Password", new[] { "Password too weak" } }
            }
        };

        SetupMockResponse(HttpStatusCode.BadRequest, JsonSerializer.Serialize(errorResponse));

        // Act & Assert
        var act = () => _usersService.CreateUserAsync(request);
        var ex = await act.Should().ThrowAsync<OnesignException>();
        ex.Which.ValidationErrors.Should().NotBeNull();
        ex.Which.ValidationErrors.Should().ContainKey("Email");
        ex.Which.ValidationErrors.Should().ContainKey("Password");
    }

    [Fact]
    public async Task UpdateUserAsync_Success_ReturnsUpdatedUser()
    {
        // Arrange
        var request = new UpdateUserRequest
        {
            FirstName = "Updated",
            LastName = "Name"
        };

        var updatedUser = new User
        {
            Id = "user-123",
            FirstName = "Updated",
            LastName = "Name"
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(updatedUser));

        // Act
        var result = await _usersService.UpdateUserAsync("user-123", request);

        // Assert
        result.Should().NotBeNull();
        result.FirstName.Should().Be("Updated");
        result.LastName.Should().Be("Name");
    }

    [Fact]
    public async Task UpdateUserAsync_UsesPutMethod()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new User { Id = "user-123" }), req => capturedRequest = req);

        // Act
        await _usersService.UpdateUserAsync("user-123", new UpdateUserRequest { FirstName = "Test" });

        // Assert
        capturedRequest!.Method.Should().Be(HttpMethod.Put);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/users/user-123");
    }

    [Fact]
    public async Task DeleteUserAsync_Success_DoesNotThrow()
    {
        // Arrange
        SetupMockResponse(HttpStatusCode.NoContent, "");

        // Act
        var act = () => _usersService.DeleteUserAsync("user-123");

        // Assert
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task DeleteUserAsync_UsesDeleteMethod()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.NoContent, "", req => capturedRequest = req);

        // Act
        await _usersService.DeleteUserAsync("user-123");

        // Assert
        capturedRequest!.Method.Should().Be(HttpMethod.Delete);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/users/user-123");
    }

    [Fact]
    public async Task ListUsersAsync_WithDefaultPagination_ReturnsUsers()
    {
        // Arrange
        var result = new PaginatedResult<User>
        {
            Items = new List<User>
            {
                new User { Id = "user-1", Email = "user1@example.com" },
                new User { Id = "user-2", Email = "user2@example.com" }
            },
            TotalCount = 2,
            PageNumber = 1,
            PageSize = 20,
            TotalPages = 1
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(result));

        // Act
        var response = await _usersService.ListUsersAsync();

        // Assert
        response.Should().NotBeNull();
        response.Items.Should().HaveCount(2);
        response.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task ListUsersAsync_WithCustomPagination_SendsQueryParams()
    {
        // Arrange
        var pagination = new PaginationRequest
        {
            PageNumber = 2,
            PageSize = 10,
            SearchTerm = "test",
            SortBy = "email",
            SortDescending = true
        };

        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new PaginatedResult<User>()), req => capturedRequest = req);

        // Act
        await _usersService.ListUsersAsync(pagination);

        // Assert
        var uri = capturedRequest!.RequestUri!.ToString();
        uri.Should().Contain("pageNumber=2");
        uri.Should().Contain("pageSize=10");
        uri.Should().Contain("search=test");
        uri.Should().Contain("sortBy=email");
        uri.Should().Contain("sortDesc=true");
    }

    [Fact]
    public async Task GetUserRolesAsync_ReturnsRoles()
    {
        // Arrange
        var roles = new List<string> { "admin", "user", "moderator" };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(roles));

        // Act
        var result = await _usersService.GetUserRolesAsync("user-123");

        // Assert
        result.Should().HaveCount(3);
        result.Should().Contain("admin");
        result.Should().Contain("user");
        result.Should().Contain("moderator");
    }

    [Fact]
    public async Task AssignRoleAsync_Success_DoesNotThrow()
    {
        // Arrange
        SetupMockResponse(HttpStatusCode.OK, "");

        // Act
        var act = () => _usersService.AssignRoleAsync("user-123", "admin");

        // Assert
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task AssignRoleAsync_UsesCorrectEndpoint()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, "", req => capturedRequest = req);

        // Act
        await _usersService.AssignRoleAsync("user-123", "admin");

        // Assert
        capturedRequest!.Method.Should().Be(HttpMethod.Post);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/users/user-123/roles/admin");
    }

    [Fact]
    public async Task RemoveRoleAsync_Success_DoesNotThrow()
    {
        // Arrange
        SetupMockResponse(HttpStatusCode.OK, "");

        // Act
        var act = () => _usersService.RemoveRoleAsync("user-123", "admin");

        // Assert
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task RemoveRoleAsync_UsesCorrectEndpoint()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, "", req => capturedRequest = req);

        // Act
        await _usersService.RemoveRoleAsync("user-123", "admin");

        // Assert
        capturedRequest!.Method.Should().Be(HttpMethod.Delete);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/users/user-123/roles/admin");
    }

    [Fact]
    public async Task GetUserAsync_SupportsCancellation()
    {
        // Arrange
        var cts = new CancellationTokenSource();
        cts.Cancel();

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(new User()));

        // Act & Assert
        await Assert.ThrowsAsync<TaskCanceledException>(
            () => _usersService.GetUserAsync("user-123", cts.Token));
    }

    [Fact]
    public async Task GetUserAsync_NullResponse_ThrowsOnesignException()
    {
        // Arrange
        SetupMockResponse(HttpStatusCode.OK, "null");

        // Act & Assert
        var act = () => _usersService.GetUserAsync("user-123");
        await act.Should().ThrowAsync<OnesignException>()
            .WithMessage("Failed to deserialize user");
    }

    private void SetupMockResponse(HttpStatusCode statusCode, string content)
    {
        _mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(content, Encoding.UTF8, "application/json")
            });
    }

    private void SetupMockResponseWithCapture(HttpStatusCode statusCode, string content, Action<HttpRequestMessage> capture)
    {
        _mockHandler.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .Callback<HttpRequestMessage, CancellationToken>((req, _) => capture(req))
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(content, Encoding.UTF8, "application/json")
            });
    }
}
