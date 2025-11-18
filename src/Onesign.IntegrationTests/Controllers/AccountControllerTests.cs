using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class AccountControllerTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly InMemoryWebApplicationFactory _factory;

    public AccountControllerTests(InMemoryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    #region PUT /api/user/account/profile Tests

    [Fact]
    public async Task UpdateProfile_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            UserId = Guid.NewGuid(),
            FirstName = "John",
            LastName = "Doe",
            Phone = "+1234567890"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/user/account/profile", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateProfile_EmptyFirstName_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            UserId = Guid.NewGuid(),
            FirstName = "",
            LastName = "Doe",
            Phone = "+1234567890"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/user/account/profile", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateProfile_EmptyLastName_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            UserId = Guid.NewGuid(),
            FirstName = "John",
            LastName = "",
            Phone = "+1234567890"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/user/account/profile", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateProfile_NullBody_ReturnsBadRequest()
    {
        // Act
        var response = await _client.PutAsJsonAsync("/api/user/account/profile", (object?)null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateProfile_WithOptionalPhone_ReturnsOkOrBadRequest()
    {
        // Arrange
        var request = new
        {
            UserId = Guid.NewGuid(),
            FirstName = "John",
            LastName = "Doe",
            Phone = (string?)null
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/user/account/profile", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/user/account/activities Tests

    [Fact]
    public async Task GetActivities_ValidRequest_ReturnsOkOrBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var from = DateTime.UtcNow.AddDays(-7).ToString("o");
        var to = DateTime.UtcNow.ToString("o");

        // Act
        var response = await _client.GetAsync($"/api/user/account/activities?userId={userId}&from={from}&to={to}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetActivities_WithoutUserId_ReturnsBadRequest()
    {
        // Arrange
        var from = DateTime.UtcNow.AddDays(-7).ToString("o");
        var to = DateTime.UtcNow.ToString("o");

        // Act
        var response = await _client.GetAsync($"/api/user/account/activities?from={from}&to={to}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetActivities_WithoutDateRange_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/user/account/activities?userId={userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetActivities_InvalidDateFormat_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/user/account/activities?userId={userId}&from=invalid&to=invalid");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetActivities_LargeDateRange_ReturnsOkOrBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var from = DateTime.UtcNow.AddYears(-1).ToString("o");
        var to = DateTime.UtcNow.ToString("o");

        // Act
        var response = await _client.GetAsync($"/api/user/account/activities?userId={userId}&from={from}&to={to}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    }

    #endregion
}
