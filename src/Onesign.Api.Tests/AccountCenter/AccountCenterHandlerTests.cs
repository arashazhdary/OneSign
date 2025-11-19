using FluentAssertions;
using Moq;
using Onesign.Modules.AccountCenter.Application.Commands;
using Onesign.Modules.AccountCenter.Application.Queries;
using Onesign.Modules.AccountCenter.Domain.Entities;
using Onesign.Modules.AccountCenter.Domain.Enums;
using Onesign.Modules.AccountCenter.Domain.Repositories;

namespace Onesign.Api.Tests.AccountCenter;

public class AccountCenterHandlerTests
{
    private readonly Mock<IUserProfileRepository> _profileRepositoryMock;
    private readonly Mock<IUserActivityRepository> _activityRepositoryMock;

    public AccountCenterHandlerTests()
    {
        _profileRepositoryMock = new Mock<IUserProfileRepository>();
        _activityRepositoryMock = new Mock<IUserActivityRepository>();
    }

    #region UpdateUserProfileCommandHandler Tests

    [Fact]
    public async Task UpdateUserProfile_WithExistingProfile_UpdatesProfile()
    {
        // Arrange
        var handler = new UpdateUserProfileCommandHandler(_profileRepositoryMock.Object);

        var userId = Guid.NewGuid();
        var existingProfile = new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DisplayName = "Old Name",
            PhoneNumber = "111",
            TimeZone = "UTC",
            PreferredLanguage = "en",
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var command = new UpdateUserProfileCommand
        {
            UserId = userId,
            DisplayName = "New Name",
            PhoneNumber = "222-222-2222",
            TimeZone = "America/New_York",
            PreferredLanguage = "es"
        };

        _profileRepositoryMock
            .Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingProfile);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.DisplayName.Should().Be("New Name");
        result.Value.PhoneNumber.Should().Be("222-222-2222");
        result.Value.TimeZone.Should().Be("America/New_York");
        result.Value.PreferredLanguage.Should().Be("es");
        _profileRepositoryMock.Verify(
            x => x.UpdateAsync(It.IsAny<UserProfile>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateUserProfile_WithNewProfile_CreatesProfile()
    {
        // Arrange
        var handler = new UpdateUserProfileCommandHandler(_profileRepositoryMock.Object);

        var userId = Guid.NewGuid();

        var command = new UpdateUserProfileCommand
        {
            UserId = userId,
            DisplayName = "John Doe",
            PhoneNumber = "123-456-7890",
            TimeZone = "UTC",
            PreferredLanguage = "en"
        };

        _profileRepositoryMock
            .Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserProfile?)null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.DisplayName.Should().Be("John Doe");
        _profileRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<UserProfile>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateUserProfile_SetsUpdatedAtTimestamp()
    {
        // Arrange
        var handler = new UpdateUserProfileCommandHandler(_profileRepositoryMock.Object);

        var userId = Guid.NewGuid();
        var existingProfile = new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var command = new UpdateUserProfileCommand
        {
            UserId = userId,
            DisplayName = "Test"
        };

        _profileRepositoryMock
            .Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingProfile);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        existingProfile.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task UpdateUserProfile_WithPartialUpdate_OnlyUpdatesProvidedFields()
    {
        // Arrange
        var handler = new UpdateUserProfileCommandHandler(_profileRepositoryMock.Object);

        var userId = Guid.NewGuid();
        var existingProfile = new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DisplayName = "Old Name",
            PhoneNumber = "111-111-1111",
            TimeZone = "UTC",
            PreferredLanguage = "en",
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var command = new UpdateUserProfileCommand
        {
            UserId = userId,
            DisplayName = "New Name"
            // Other fields are null - should update to null
        };

        _profileRepositoryMock
            .Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingProfile);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value!.DisplayName.Should().Be("New Name");
    }

    [Fact]
    public async Task UpdateUserProfile_ReturnsCorrectDto()
    {
        // Arrange
        var handler = new UpdateUserProfileCommandHandler(_profileRepositoryMock.Object);

        var userId = Guid.NewGuid();
        var profileId = Guid.NewGuid();
        var existingProfile = new UserProfile
        {
            Id = profileId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var command = new UpdateUserProfileCommand
        {
            UserId = userId,
            DisplayName = "Test User",
            PhoneNumber = "555-1234",
            TimeZone = "PST",
            PreferredLanguage = "fr"
        };

        _profileRepositoryMock
            .Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingProfile);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value!.Id.Should().Be(profileId);
        result.Value.UserId.Should().Be(userId);
        result.Value.DisplayName.Should().Be("Test User");
        result.Value.PhoneNumber.Should().Be("555-1234");
        result.Value.TimeZone.Should().Be("PST");
        result.Value.PreferredLanguage.Should().Be("fr");
    }

    #endregion

    #region GetUserActivitiesQueryHandler Tests

    [Fact]
    public async Task GetUserActivities_ReturnsActivities()
    {
        // Arrange
        var handler = new GetUserActivitiesQueryHandler(_activityRepositoryMock.Object);

        var userId = Guid.NewGuid();
        var activities = new List<UserActivity>
        {
            new UserActivity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ActivityType = ActivityType.Login,
                Description = "Logged in",
                IpAddress = "192.168.1.1",
                OccurredAt = DateTime.UtcNow
            },
            new UserActivity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ActivityType = ActivityType.ProfileUpdate,
                Description = "Updated profile",
                IpAddress = "192.168.1.2",
                OccurredAt = DateTime.UtcNow.AddHours(-1)
            }
        };

        var query = new GetUserActivitiesQuery
        {
            UserId = userId,
            From = DateTime.UtcNow.AddDays(-7),
            To = DateTime.UtcNow,
            Skip = 0,
            Take = 50
        };

        _activityRepositoryMock
            .Setup(x => x.GetByUserIdAsync(userId, query.From, query.To, 0, 50, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activities);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetUserActivities_MapsFieldsCorrectly()
    {
        // Arrange
        var handler = new GetUserActivitiesQueryHandler(_activityRepositoryMock.Object);

        var userId = Guid.NewGuid();
        var activityId = Guid.NewGuid();
        var occurredAt = DateTime.UtcNow;

        var activities = new List<UserActivity>
        {
            new UserActivity
            {
                Id = activityId,
                UserId = userId,
                ActivityType = ActivityType.Login,
                Description = "Successful login",
                IpAddress = "10.0.0.1",
                OccurredAt = occurredAt
            }
        };

        var query = new GetUserActivitiesQuery
        {
            UserId = userId,
            From = DateTime.UtcNow.AddDays(-1),
            To = DateTime.UtcNow.AddDays(1),
            Take = 50
        };

        _activityRepositoryMock
            .Setup(x => x.GetByUserIdAsync(userId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), 0, 50, It.IsAny<CancellationToken>()))
            .ReturnsAsync(activities);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var dto = result.Value![0];
        dto.Id.Should().Be(activityId);
        dto.ActivityType.Should().Be("Login");
        dto.Description.Should().Be("Successful login");
        dto.IpAddress.Should().Be("10.0.0.1");
        dto.OccurredAt.Should().Be(occurredAt);
    }

    [Fact]
    public async Task GetUserActivities_WithPagination_CallsRepositoryCorrectly()
    {
        // Arrange
        var handler = new GetUserActivitiesQueryHandler(_activityRepositoryMock.Object);

        var userId = Guid.NewGuid();
        var from = DateTime.UtcNow.AddDays(-30);
        var to = DateTime.UtcNow;

        var query = new GetUserActivitiesQuery
        {
            UserId = userId,
            From = from,
            To = to,
            Skip = 10,
            Take = 25
        };

        _activityRepositoryMock
            .Setup(x => x.GetByUserIdAsync(userId, from, to, 10, 25, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserActivity>());

        // Act
        await handler.Handle(query, CancellationToken.None);

        // Assert
        _activityRepositoryMock.Verify(
            x => x.GetByUserIdAsync(userId, from, to, 10, 25, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetUserActivities_WithEmptyResult_ReturnsEmptyList()
    {
        // Arrange
        var handler = new GetUserActivitiesQueryHandler(_activityRepositoryMock.Object);

        var query = new GetUserActivitiesQuery
        {
            UserId = Guid.NewGuid(),
            From = DateTime.UtcNow.AddDays(-1),
            To = DateTime.UtcNow
        };

        _activityRepositoryMock
            .Setup(x => x.GetByUserIdAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserActivity>());

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task GetUserActivities_WithDefaultTake_Uses50()
    {
        // Arrange
        var handler = new GetUserActivitiesQueryHandler(_activityRepositoryMock.Object);

        var userId = Guid.NewGuid();

        var query = new GetUserActivitiesQuery
        {
            UserId = userId,
            From = DateTime.UtcNow.AddDays(-1),
            To = DateTime.UtcNow
            // Take is default (50)
        };

        _activityRepositoryMock
            .Setup(x => x.GetByUserIdAsync(userId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), 0, 50, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserActivity>());

        // Act
        await handler.Handle(query, CancellationToken.None);

        // Assert
        _activityRepositoryMock.Verify(
            x => x.GetByUserIdAsync(userId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), 0, 50, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion
}
