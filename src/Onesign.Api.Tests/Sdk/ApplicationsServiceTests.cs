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

public class ApplicationsServiceTests
{
    private readonly Mock<HttpMessageHandler> _mockHandler;
    private readonly HttpClient _httpClient;
    private readonly Mock<AuthService> _mockAuthService;
    private readonly ApplicationsService _applicationsService;

    public ApplicationsServiceTests()
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

        _applicationsService = new ApplicationsService(_httpClient, _mockAuthService.Object);
    }

    [Fact]
    public async Task GetApplicationAsync_Success_ReturnsApplication()
    {
        // Arrange
        var app = new Application
        {
            Id = "app-123",
            ClientId = "my-client",
            DisplayName = "My Application",
            ApplicationType = "web",
            Enabled = true
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(app));

        // Act
        var result = await _applicationsService.GetApplicationAsync("app-123");

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be("app-123");
        result.ClientId.Should().Be("my-client");
        result.DisplayName.Should().Be("My Application");
    }

    [Fact]
    public async Task GetApplicationAsync_NotFound_ThrowsOnesignException()
    {
        // Arrange
        var errorResponse = new ErrorResponse
        {
            Error = "not_found",
            ErrorDescription = "Application not found"
        };

        SetupMockResponse(HttpStatusCode.NotFound, JsonSerializer.Serialize(errorResponse));

        // Act & Assert
        var act = () => _applicationsService.GetApplicationAsync("nonexistent");
        await act.Should().ThrowAsync<OnesignException>()
            .Where(e => e.StatusCode == HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetApplicationByClientIdAsync_Success_ReturnsApplication()
    {
        // Arrange
        var app = new Application
        {
            Id = "app-456",
            ClientId = "my-client-id"
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(app));

        // Act
        var result = await _applicationsService.GetApplicationByClientIdAsync("my-client-id");

        // Assert
        result.Should().NotBeNull();
        result.ClientId.Should().Be("my-client-id");
    }

    [Fact]
    public async Task GetApplicationByClientIdAsync_EncodesClientId()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new Application { Id = "app-123" }), req => capturedRequest = req);

        // Act
        await _applicationsService.GetApplicationByClientIdAsync("client+special@chars");

        // Assert
        capturedRequest!.RequestUri!.AbsoluteUri.Should().Contain("client%2Bspecial%40chars");
    }

    [Fact]
    public async Task CreateApplicationAsync_Success_ReturnsCreatedApplication()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            DisplayName = "New App",
            ApplicationType = "spa",
            Description = "A new application",
            RedirectUris = new List<string> { "https://app.com/callback" }
        };

        var createdApp = new Application
        {
            Id = "new-app-id",
            ClientId = "generated-client-id",
            DisplayName = "New App",
            ApplicationType = "spa"
        };

        SetupMockResponse(HttpStatusCode.Created, JsonSerializer.Serialize(createdApp));

        // Act
        var result = await _applicationsService.CreateApplicationAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be("new-app-id");
        result.ClientId.Should().NotBeNullOrEmpty();
        result.DisplayName.Should().Be("New App");
    }

    [Fact]
    public async Task CreateApplicationAsync_SendsCorrectPayload()
    {
        // Arrange
        var request = new CreateApplicationRequest
        {
            DisplayName = "Test App",
            ApplicationType = "native",
            RedirectUris = new List<string> { "myapp://callback" }
        };

        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.Created, JsonSerializer.Serialize(new Application { Id = "new-id" }), req => capturedRequest = req);

        // Act
        await _applicationsService.CreateApplicationAsync(request);

        // Assert
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Method.Should().Be(HttpMethod.Post);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/applications");

        var content = await capturedRequest.Content!.ReadAsStringAsync();
        content.Should().Contain("Test App");
        content.Should().Contain("native");
    }

    [Fact]
    public async Task UpdateApplicationAsync_Success_ReturnsUpdatedApplication()
    {
        // Arrange
        var request = new UpdateApplicationRequest
        {
            DisplayName = "Updated Name",
            Description = "Updated description"
        };

        var updatedApp = new Application
        {
            Id = "app-123",
            DisplayName = "Updated Name",
            Description = "Updated description"
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(updatedApp));

        // Act
        var result = await _applicationsService.UpdateApplicationAsync("app-123", request);

        // Assert
        result.Should().NotBeNull();
        result.DisplayName.Should().Be("Updated Name");
        result.Description.Should().Be("Updated description");
    }

    [Fact]
    public async Task UpdateApplicationAsync_UsesPutMethod()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new Application { Id = "app-123" }), req => capturedRequest = req);

        // Act
        await _applicationsService.UpdateApplicationAsync("app-123", new UpdateApplicationRequest { DisplayName = "Test" });

        // Assert
        capturedRequest!.Method.Should().Be(HttpMethod.Put);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/applications/app-123");
    }

    [Fact]
    public async Task DeleteApplicationAsync_Success_DoesNotThrow()
    {
        // Arrange
        SetupMockResponse(HttpStatusCode.NoContent, "");

        // Act
        var act = () => _applicationsService.DeleteApplicationAsync("app-123");

        // Assert
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task DeleteApplicationAsync_UsesDeleteMethod()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.NoContent, "", req => capturedRequest = req);

        // Act
        await _applicationsService.DeleteApplicationAsync("app-123");

        // Assert
        capturedRequest!.Method.Should().Be(HttpMethod.Delete);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/applications/app-123");
    }

    [Fact]
    public async Task ListApplicationsAsync_WithDefaultPagination_ReturnsApplications()
    {
        // Arrange
        var result = new PaginatedResult<Application>
        {
            Items = new List<Application>
            {
                new Application { Id = "app-1", DisplayName = "App 1" },
                new Application { Id = "app-2", DisplayName = "App 2" }
            },
            TotalCount = 2,
            PageNumber = 1,
            PageSize = 20,
            TotalPages = 1
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(result));

        // Act
        var response = await _applicationsService.ListApplicationsAsync();

        // Assert
        response.Should().NotBeNull();
        response.Items.Should().HaveCount(2);
        response.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task ListApplicationsAsync_WithCustomPagination_SendsQueryParams()
    {
        // Arrange
        var pagination = new PaginationRequest
        {
            PageNumber = 3,
            PageSize = 50,
            SortBy = "displayName",
            SortDescending = false
        };

        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new PaginatedResult<Application>()), req => capturedRequest = req);

        // Act
        await _applicationsService.ListApplicationsAsync(pagination);

        // Assert
        var uri = capturedRequest!.RequestUri!.ToString();
        uri.Should().Contain("pageNumber=3");
        uri.Should().Contain("pageSize=50");
        uri.Should().Contain("sortBy=displayName");
        uri.Should().Contain("sortDesc=false");
    }

    [Fact]
    public async Task RegenerateClientSecretAsync_ReturnsNewSecret()
    {
        // Arrange
        var response = new Dictionary<string, string>
        {
            { "clientSecret", "new-secret-value-123" }
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(response));

        // Act
        var result = await _applicationsService.RegenerateClientSecretAsync("app-123");

        // Assert
        result.Should().Be("new-secret-value-123");
    }

    [Fact]
    public async Task RegenerateClientSecretAsync_UsesPostMethod()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new Dictionary<string, string> { { "clientSecret", "secret" } }), req => capturedRequest = req);

        // Act
        await _applicationsService.RegenerateClientSecretAsync("app-123");

        // Assert
        capturedRequest!.Method.Should().Be(HttpMethod.Post);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/applications/app-123/regenerate-secret");
    }

    [Fact]
    public async Task GetApplicationAsync_SetsAuthorizationHeader()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new Application { Id = "app-123" }), req => capturedRequest = req);

        // Act
        await _applicationsService.GetApplicationAsync("app-123");

        // Assert
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Headers.Authorization.Should().NotBeNull();
        capturedRequest.Headers.Authorization!.Scheme.Should().Be("Bearer");
        capturedRequest.Headers.Authorization.Parameter.Should().Be("test-access-token");
    }

    [Fact]
    public async Task GetApplicationAsync_SupportsCancellation()
    {
        // Arrange
        var cts = new CancellationTokenSource();
        cts.Cancel();

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(new Application()));

        // Act & Assert
        await Assert.ThrowsAsync<TaskCanceledException>(
            () => _applicationsService.GetApplicationAsync("app-123", cts.Token));
    }

    [Fact]
    public async Task CreateApplicationAsync_ValidationError_ThrowsWithValidationErrors()
    {
        // Arrange
        var errorResponse = new ErrorResponse
        {
            Error = "validation_error",
            ErrorDescription = "Validation failed",
            ValidationErrors = new Dictionary<string, string[]>
            {
                { "DisplayName", new[] { "Name is required" } }
            }
        };

        SetupMockResponse(HttpStatusCode.BadRequest, JsonSerializer.Serialize(errorResponse));

        // Act & Assert
        var act = () => _applicationsService.CreateApplicationAsync(new CreateApplicationRequest());
        var ex = await act.Should().ThrowAsync<OnesignException>();
        ex.Which.IsValidationError.Should().BeTrue();
    }

    [Fact]
    public async Task ListApplicationsAsync_WithNullPagination_UsesDefaults()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new PaginatedResult<Application>()), req => capturedRequest = req);

        // Act
        await _applicationsService.ListApplicationsAsync(null);

        // Assert
        var uri = capturedRequest!.RequestUri!.ToString();
        uri.Should().Contain("pageNumber=1");
        uri.Should().Contain("pageSize=20");
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
