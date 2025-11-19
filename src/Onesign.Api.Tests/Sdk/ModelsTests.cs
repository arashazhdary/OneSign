using System.Net;
using FluentAssertions;
using Onesign.Sdk.DotNet.Models;
using Xunit;

namespace Onesign.Api.Tests.Sdk;

public class OnesignExceptionTests
{
    [Fact]
    public void Constructor_WithMessage_SetsProperties()
    {
        // Act
        var ex = new OnesignException("Test error");

        // Assert
        ex.Message.Should().Be("Test error");
        ex.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        ex.ErrorCode.Should().BeNull();
        ex.ValidationErrors.Should().BeNull();
        ex.TraceId.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithMessageAndStatusCode_SetsProperties()
    {
        // Act
        var ex = new OnesignException("Not found", HttpStatusCode.NotFound);

        // Assert
        ex.Message.Should().Be("Not found");
        ex.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public void Constructor_WithMessageStatusCodeAndErrorCode_SetsProperties()
    {
        // Act
        var ex = new OnesignException("Unauthorized", HttpStatusCode.Unauthorized, "invalid_token");

        // Assert
        ex.Message.Should().Be("Unauthorized");
        ex.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        ex.ErrorCode.Should().Be("invalid_token");
    }

    [Fact]
    public void Constructor_WithAllParameters_SetsProperties()
    {
        // Arrange
        var validationErrors = new Dictionary<string, string[]>
        {
            { "Email", new[] { "Invalid format" } }
        };

        // Act
        var ex = new OnesignException("Validation failed", HttpStatusCode.BadRequest, "validation_error", validationErrors, "trace-123");

        // Assert
        ex.Message.Should().Be("Validation failed");
        ex.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        ex.ErrorCode.Should().Be("validation_error");
        ex.ValidationErrors.Should().NotBeNull();
        ex.ValidationErrors.Should().ContainKey("Email");
        ex.TraceId.Should().Be("trace-123");
    }

    [Fact]
    public void Constructor_WithInnerException_SetsProperties()
    {
        // Arrange
        var innerEx = new InvalidOperationException("Inner error");

        // Act
        var ex = new OnesignException("Outer error", innerEx);

        // Assert
        ex.Message.Should().Be("Outer error");
        ex.InnerException.Should().Be(innerEx);
        ex.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
    }

    [Fact]
    public void IsValidationError_WithBadRequestAndErrors_ReturnsTrue()
    {
        // Arrange
        var validationErrors = new Dictionary<string, string[]>
        {
            { "Field", new[] { "Error" } }
        };
        var ex = new OnesignException("Validation failed", HttpStatusCode.BadRequest, "validation_error", validationErrors, null);

        // Act & Assert
        ex.IsValidationError.Should().BeTrue();
    }

    [Fact]
    public void IsValidationError_WithBadRequestButNoErrors_ReturnsFalse()
    {
        // Arrange
        var ex = new OnesignException("Bad request", HttpStatusCode.BadRequest);

        // Act & Assert
        ex.IsValidationError.Should().BeFalse();
    }

    [Fact]
    public void IsUnauthorized_WithUnauthorizedStatus_ReturnsTrue()
    {
        // Arrange
        var ex = new OnesignException("Unauthorized", HttpStatusCode.Unauthorized);

        // Act & Assert
        ex.IsUnauthorized.Should().BeTrue();
    }

    [Fact]
    public void IsForbidden_WithForbiddenStatus_ReturnsTrue()
    {
        // Arrange
        var ex = new OnesignException("Forbidden", HttpStatusCode.Forbidden);

        // Act & Assert
        ex.IsForbidden.Should().BeTrue();
    }

    [Fact]
    public void IsNotFound_WithNotFoundStatus_ReturnsTrue()
    {
        // Arrange
        var ex = new OnesignException("Not found", HttpStatusCode.NotFound);

        // Act & Assert
        ex.IsNotFound.Should().BeTrue();
    }
}

public class OnesignAuthenticationExceptionTests
{
    [Fact]
    public void Constructor_SetsUnauthorizedStatus()
    {
        // Act
        var ex = new OnesignAuthenticationException("Auth failed");

        // Assert
        ex.Message.Should().Be("Auth failed");
        ex.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}

public class OnesignValidationExceptionTests
{
    [Fact]
    public void Constructor_WithMessage_SetsProperties()
    {
        // Act
        var ex = new OnesignValidationException("Validation failed");

        // Assert
        ex.Message.Should().Be("Validation failed");
        ex.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        ex.ErrorCode.Should().Be("validation_error");
    }

    [Fact]
    public void Constructor_WithValidationErrors_SetsProperties()
    {
        // Arrange
        var errors = new Dictionary<string, string[]>
        {
            { "Email", new[] { "Invalid email" } }
        };

        // Act
        var ex = new OnesignValidationException("Validation failed", errors);

        // Assert
        ex.ValidationErrors.Should().NotBeNull();
        ex.ValidationErrors.Should().ContainKey("Email");
        ex.IsValidationError.Should().BeTrue();
    }
}

public class TokenResponseTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var token = new TokenResponse();

        // Assert
        token.AccessToken.Should().Be(string.Empty);
        token.TokenType.Should().Be("Bearer");
        token.ExpiresIn.Should().Be(0);
        token.RefreshToken.Should().BeNull();
        token.IdToken.Should().BeNull();
        token.Scope.Should().BeNull();
    }

    [Fact]
    public void IsExpired_WithFutureExpiration_ReturnsFalse()
    {
        // Arrange
        var token = new TokenResponse
        {
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1)
        };

        // Act & Assert
        token.IsExpired.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WithPastExpiration_ReturnsTrue()
    {
        // Arrange
        var token = new TokenResponse
        {
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(-1)
        };

        // Act & Assert
        token.IsExpired.Should().BeTrue();
    }

    [Fact]
    public void IsExpired_WithCurrentTime_ReturnsTrue()
    {
        // Arrange
        var token = new TokenResponse
        {
            ExpiresAt = DateTimeOffset.UtcNow
        };

        // Act & Assert
        token.IsExpired.Should().BeTrue();
    }
}

public class PaginatedResultTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var result = new PaginatedResult<string>();

        // Assert
        result.Items.Should().NotBeNull();
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
        result.PageNumber.Should().Be(0);
        result.PageSize.Should().Be(0);
        result.TotalPages.Should().Be(0);
    }

    [Fact]
    public void HasPreviousPage_OnFirstPage_ReturnsFalse()
    {
        // Arrange
        var result = new PaginatedResult<string> { PageNumber = 1 };

        // Act & Assert
        result.HasPreviousPage.Should().BeFalse();
    }

    [Fact]
    public void HasPreviousPage_OnSecondPage_ReturnsTrue()
    {
        // Arrange
        var result = new PaginatedResult<string> { PageNumber = 2 };

        // Act & Assert
        result.HasPreviousPage.Should().BeTrue();
    }

    [Fact]
    public void HasNextPage_OnLastPage_ReturnsFalse()
    {
        // Arrange
        var result = new PaginatedResult<string> { PageNumber = 5, TotalPages = 5 };

        // Act & Assert
        result.HasNextPage.Should().BeFalse();
    }

    [Fact]
    public void HasNextPage_NotOnLastPage_ReturnsTrue()
    {
        // Arrange
        var result = new PaginatedResult<string> { PageNumber = 3, TotalPages = 5 };

        // Act & Assert
        result.HasNextPage.Should().BeTrue();
    }
}

public class PaginationRequestTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var request = new PaginationRequest();

        // Assert
        request.PageNumber.Should().Be(1);
        request.PageSize.Should().Be(20);
        request.SearchTerm.Should().BeNull();
        request.SortBy.Should().BeNull();
        request.SortDescending.Should().BeFalse();
    }

    [Fact]
    public void ToQueryParameters_WithDefaults_ReturnsBasicParams()
    {
        // Arrange
        var request = new PaginationRequest();

        // Act
        var parameters = request.ToQueryParameters();

        // Assert
        parameters.Should().ContainKey("pageNumber");
        parameters.Should().ContainKey("pageSize");
        parameters["pageNumber"].Should().Be("1");
        parameters["pageSize"].Should().Be("20");
        parameters.Should().NotContainKey("search");
        parameters.Should().NotContainKey("sortBy");
    }

    [Fact]
    public void ToQueryParameters_WithSearchTerm_IncludesSearch()
    {
        // Arrange
        var request = new PaginationRequest { SearchTerm = "test" };

        // Act
        var parameters = request.ToQueryParameters();

        // Assert
        parameters.Should().ContainKey("search");
        parameters["search"].Should().Be("test");
    }

    [Fact]
    public void ToQueryParameters_WithSortBy_IncludesSortParams()
    {
        // Arrange
        var request = new PaginationRequest { SortBy = "name", SortDescending = true };

        // Act
        var parameters = request.ToQueryParameters();

        // Assert
        parameters.Should().ContainKey("sortBy");
        parameters.Should().ContainKey("sortDesc");
        parameters["sortBy"].Should().Be("name");
        parameters["sortDesc"].Should().Be("true");
    }

    [Fact]
    public void ToQueryParameters_WithAllParams_IncludesAll()
    {
        // Arrange
        var request = new PaginationRequest
        {
            PageNumber = 3,
            PageSize = 50,
            SearchTerm = "query",
            SortBy = "email",
            SortDescending = false
        };

        // Act
        var parameters = request.ToQueryParameters();

        // Assert
        parameters["pageNumber"].Should().Be("3");
        parameters["pageSize"].Should().Be("50");
        parameters["search"].Should().Be("query");
        parameters["sortBy"].Should().Be("email");
        parameters["sortDesc"].Should().Be("false");
    }
}

public class ApiResponseTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var response = new ApiResponse();

        // Assert
        response.Success.Should().BeFalse();
        response.Message.Should().BeNull();
        response.Errors.Should().BeNull();
    }

    [Fact]
    public void GenericApiResponse_CanSetData()
    {
        // Act
        var response = new ApiResponse<string>
        {
            Success = true,
            Data = "test data"
        };

        // Assert
        response.Success.Should().BeTrue();
        response.Data.Should().Be("test data");
    }
}

public class ErrorResponseTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var error = new ErrorResponse();

        // Assert
        error.Error.Should().Be(string.Empty);
        error.ErrorDescription.Should().BeNull();
        error.ValidationErrors.Should().BeNull();
        error.TraceId.Should().BeNull();
    }

    [Fact]
    public void CanSetAllProperties()
    {
        // Act
        var error = new ErrorResponse
        {
            Error = "invalid_request",
            ErrorDescription = "The request is invalid",
            ValidationErrors = new Dictionary<string, string[]>
            {
                { "field", new[] { "error1", "error2" } }
            },
            TraceId = "trace-123"
        };

        // Assert
        error.Error.Should().Be("invalid_request");
        error.ErrorDescription.Should().Be("The request is invalid");
        error.ValidationErrors.Should().ContainKey("field");
        error.ValidationErrors!["field"].Should().HaveCount(2);
        error.TraceId.Should().Be("trace-123");
    }
}

public class UserModelTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var user = new User();

        // Assert
        user.Id.Should().Be(string.Empty);
        user.Email.Should().Be(string.Empty);
        user.Username.Should().BeNull();
        user.FirstName.Should().BeNull();
        user.LastName.Should().BeNull();
        user.PhoneNumber.Should().BeNull();
        user.EmailConfirmed.Should().BeFalse();
        user.TwoFactorEnabled.Should().BeFalse();
        user.Roles.Should().NotBeNull();
        user.Roles.Should().BeEmpty();
        user.Claims.Should().NotBeNull();
        user.Claims.Should().BeEmpty();
    }
}

public class ApplicationModelTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var app = new Application();

        // Assert
        app.Id.Should().Be(string.Empty);
        app.ClientId.Should().Be(string.Empty);
        app.DisplayName.Should().Be(string.Empty);
        app.ApplicationType.Should().Be(string.Empty);
        app.Enabled.Should().BeTrue();
        app.RedirectUris.Should().NotBeNull();
        app.RedirectUris.Should().BeEmpty();
        app.PostLogoutRedirectUris.Should().NotBeNull();
        app.Permissions.Should().NotBeNull();
    }
}

public class TenantModelTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var tenant = new Tenant();

        // Assert
        tenant.Id.Should().Be(string.Empty);
        tenant.Name.Should().Be(string.Empty);
        tenant.DisplayName.Should().Be(string.Empty);
        tenant.Domain.Should().BeNull();
        tenant.Enabled.Should().BeTrue();
        tenant.Settings.Should().NotBeNull();
    }
}

public class TenantSettingsTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var settings = new TenantSettings();

        // Assert
        settings.AllowSelfRegistration.Should().BeTrue();
        settings.RequireEmailConfirmation.Should().BeTrue();
        settings.RequireMfa.Should().BeFalse();
        settings.SessionLifetimeMinutes.Should().Be(60);
        settings.RefreshTokenLifetimeDays.Should().Be(30);
        settings.PasswordPolicy.Should().NotBeNull();
    }
}

public class PasswordPolicyTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var policy = new PasswordPolicy();

        // Assert
        policy.MinLength.Should().Be(8);
        policy.RequireUppercase.Should().BeTrue();
        policy.RequireLowercase.Should().BeTrue();
        policy.RequireDigit.Should().BeTrue();
        policy.RequireNonAlphanumeric.Should().BeFalse();
    }
}
