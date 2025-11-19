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

public class TenantsServiceTests
{
    private readonly Mock<HttpMessageHandler> _mockHandler;
    private readonly HttpClient _httpClient;
    private readonly Mock<AuthService> _mockAuthService;
    private readonly TenantsService _tenantsService;

    public TenantsServiceTests()
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

        _tenantsService = new TenantsService(_httpClient, _mockAuthService.Object);
    }

    [Fact]
    public async Task GetTenantAsync_Success_ReturnsTenant()
    {
        // Arrange
        var tenant = new Tenant
        {
            Id = "tenant-123",
            Name = "my-tenant",
            DisplayName = "My Tenant",
            Domain = "tenant.example.com",
            Enabled = true
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tenant));

        // Act
        var result = await _tenantsService.GetTenantAsync("tenant-123");

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be("tenant-123");
        result.Name.Should().Be("my-tenant");
        result.DisplayName.Should().Be("My Tenant");
    }

    [Fact]
    public async Task GetTenantAsync_NotFound_ThrowsOnesignException()
    {
        // Arrange
        var errorResponse = new ErrorResponse
        {
            Error = "not_found",
            ErrorDescription = "Tenant not found"
        };

        SetupMockResponse(HttpStatusCode.NotFound, JsonSerializer.Serialize(errorResponse));

        // Act & Assert
        var act = () => _tenantsService.GetTenantAsync("nonexistent");
        await act.Should().ThrowAsync<OnesignException>()
            .Where(e => e.StatusCode == HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCurrentTenantAsync_Success_ReturnsTenant()
    {
        // Arrange
        var tenant = new Tenant
        {
            Id = "current-tenant",
            Name = "current",
            DisplayName = "Current Tenant"
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(tenant));

        // Act
        var result = await _tenantsService.GetCurrentTenantAsync();

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be("current-tenant");
    }

    [Fact]
    public async Task GetCurrentTenantAsync_UsesCorrectEndpoint()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new Tenant { Id = "tenant-123" }), req => capturedRequest = req);

        // Act
        await _tenantsService.GetCurrentTenantAsync();

        // Assert
        capturedRequest!.RequestUri!.PathAndQuery.Should().Be("/api/tenants/current");
    }

    [Fact]
    public async Task UpdateSettingsAsync_Success_ReturnsUpdatedTenant()
    {
        // Arrange
        var request = new UpdateTenantSettingsRequest
        {
            DisplayName = "Updated Tenant",
            Domain = "new-domain.example.com",
            PrimaryColor = "#FF5733"
        };

        var updatedTenant = new Tenant
        {
            Id = "tenant-123",
            DisplayName = "Updated Tenant",
            Domain = "new-domain.example.com",
            PrimaryColor = "#FF5733"
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(updatedTenant));

        // Act
        var result = await _tenantsService.UpdateSettingsAsync("tenant-123", request);

        // Assert
        result.Should().NotBeNull();
        result.DisplayName.Should().Be("Updated Tenant");
        result.Domain.Should().Be("new-domain.example.com");
        result.PrimaryColor.Should().Be("#FF5733");
    }

    [Fact]
    public async Task UpdateSettingsAsync_UsesPutMethod()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new Tenant { Id = "tenant-123" }), req => capturedRequest = req);

        // Act
        await _tenantsService.UpdateSettingsAsync("tenant-123", new UpdateTenantSettingsRequest { DisplayName = "Test" });

        // Assert
        capturedRequest!.Method.Should().Be(HttpMethod.Put);
        capturedRequest.RequestUri!.PathAndQuery.Should().Be("/api/tenants/tenant-123/settings");
    }

    [Fact]
    public async Task GetSettingsAsync_ReturnsSettings()
    {
        // Arrange
        var settings = new TenantSettings
        {
            AllowSelfRegistration = true,
            RequireEmailConfirmation = true,
            RequireMfa = false,
            SessionLifetimeMinutes = 60,
            RefreshTokenLifetimeDays = 30,
            PasswordPolicy = new PasswordPolicy
            {
                MinLength = 8,
                RequireUppercase = true,
                RequireLowercase = true,
                RequireDigit = true,
                RequireNonAlphanumeric = false
            }
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(settings));

        // Act
        var result = await _tenantsService.GetSettingsAsync("tenant-123");

        // Assert
        result.Should().NotBeNull();
        result.AllowSelfRegistration.Should().BeTrue();
        result.RequireMfa.Should().BeFalse();
        result.PasswordPolicy.MinLength.Should().Be(8);
    }

    [Fact]
    public async Task GetSettingsAsync_UsesCorrectEndpoint()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new TenantSettings()), req => capturedRequest = req);

        // Act
        await _tenantsService.GetSettingsAsync("tenant-123");

        // Assert
        capturedRequest!.RequestUri!.PathAndQuery.Should().Be("/api/tenants/tenant-123/settings");
    }

    [Fact]
    public async Task ListTenantsAsync_WithDefaultPagination_ReturnsTenants()
    {
        // Arrange
        var result = new PaginatedResult<Tenant>
        {
            Items = new List<Tenant>
            {
                new Tenant { Id = "tenant-1", DisplayName = "Tenant 1" },
                new Tenant { Id = "tenant-2", DisplayName = "Tenant 2" }
            },
            TotalCount = 2,
            PageNumber = 1,
            PageSize = 20,
            TotalPages = 1
        };

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(result));

        // Act
        var response = await _tenantsService.ListTenantsAsync();

        // Assert
        response.Should().NotBeNull();
        response.Items.Should().HaveCount(2);
        response.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task ListTenantsAsync_WithCustomPagination_SendsQueryParams()
    {
        // Arrange
        var pagination = new PaginationRequest
        {
            PageNumber = 2,
            PageSize = 10,
            SearchTerm = "test",
            SortBy = "name",
            SortDescending = true
        };

        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new PaginatedResult<Tenant>()), req => capturedRequest = req);

        // Act
        await _tenantsService.ListTenantsAsync(pagination);

        // Assert
        var uri = capturedRequest!.RequestUri!.ToString();
        uri.Should().Contain("pageNumber=2");
        uri.Should().Contain("pageSize=10");
        uri.Should().Contain("search=test");
        uri.Should().Contain("sortBy=name");
        uri.Should().Contain("sortDesc=true");
    }

    [Fact]
    public async Task GetTenantAsync_SetsAuthorizationHeader()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new Tenant { Id = "tenant-123" }), req => capturedRequest = req);

        // Act
        await _tenantsService.GetTenantAsync("tenant-123");

        // Assert
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Headers.Authorization.Should().NotBeNull();
        capturedRequest.Headers.Authorization!.Scheme.Should().Be("Bearer");
        capturedRequest.Headers.Authorization.Parameter.Should().Be("test-access-token");
    }

    [Fact]
    public async Task GetTenantAsync_SupportsCancellation()
    {
        // Arrange
        var cts = new CancellationTokenSource();
        cts.Cancel();

        SetupMockResponse(HttpStatusCode.OK, JsonSerializer.Serialize(new Tenant()));

        // Act & Assert
        await Assert.ThrowsAsync<TaskCanceledException>(
            () => _tenantsService.GetTenantAsync("tenant-123", cts.Token));
    }

    [Fact]
    public async Task UpdateSettingsAsync_ValidationError_ThrowsWithValidationErrors()
    {
        // Arrange
        var errorResponse = new ErrorResponse
        {
            Error = "validation_error",
            ErrorDescription = "Validation failed",
            ValidationErrors = new Dictionary<string, string[]>
            {
                { "Domain", new[] { "Invalid domain format" } }
            }
        };

        SetupMockResponse(HttpStatusCode.BadRequest, JsonSerializer.Serialize(errorResponse));

        // Act & Assert
        var act = () => _tenantsService.UpdateSettingsAsync("tenant-123", new UpdateTenantSettingsRequest { Domain = "invalid" });
        var ex = await act.Should().ThrowAsync<OnesignException>();
        ex.Which.IsValidationError.Should().BeTrue();
    }

    [Fact]
    public async Task ListTenantsAsync_WithNullPagination_UsesDefaults()
    {
        // Arrange
        HttpRequestMessage? capturedRequest = null;
        SetupMockResponseWithCapture(HttpStatusCode.OK, JsonSerializer.Serialize(new PaginatedResult<Tenant>()), req => capturedRequest = req);

        // Act
        await _tenantsService.ListTenantsAsync(null);

        // Assert
        var uri = capturedRequest!.RequestUri!.ToString();
        uri.Should().Contain("pageNumber=1");
        uri.Should().Contain("pageSize=20");
    }

    [Fact]
    public async Task GetTenantAsync_NullResponse_ThrowsOnesignException()
    {
        // Arrange
        SetupMockResponse(HttpStatusCode.OK, "null");

        // Act & Assert
        var act = () => _tenantsService.GetTenantAsync("tenant-123");
        await act.Should().ThrowAsync<OnesignException>()
            .WithMessage("Failed to deserialize tenant");
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
