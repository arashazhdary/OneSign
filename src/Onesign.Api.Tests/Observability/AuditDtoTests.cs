using FluentAssertions;
using Onesign.Modules.Observability.Application.DTOs;
using Onesign.Modules.Observability.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Observability;

public class AuditDtoTests
{
    #region AuditSearchResultDto Tests

    [Fact]
    public void AuditSearchResultDto_TotalPages_CalculatesCorrectly()
    {
        // Arrange
        var dto = new AuditSearchResultDto
        {
            TotalCount = 100,
            PageSize = 10
        };

        // Assert
        dto.TotalPages.Should().Be(10);
    }

    [Fact]
    public void AuditSearchResultDto_TotalPages_RoundsUpForPartialPage()
    {
        // Arrange
        var dto = new AuditSearchResultDto
        {
            TotalCount = 25,
            PageSize = 10
        };

        // Assert
        dto.TotalPages.Should().Be(3);
    }

    [Fact]
    public void AuditSearchResultDto_TotalPages_ReturnsOneForSinglePage()
    {
        // Arrange
        var dto = new AuditSearchResultDto
        {
            TotalCount = 5,
            PageSize = 10
        };

        // Assert
        dto.TotalPages.Should().Be(1);
    }

    [Fact]
    public void AuditSearchResultDto_TotalPages_ReturnsZeroForEmptyResult()
    {
        // Arrange
        var dto = new AuditSearchResultDto
        {
            TotalCount = 0,
            PageSize = 10
        };

        // Assert
        dto.TotalPages.Should().Be(0);
    }

    [Fact]
    public void AuditSearchResultDto_TotalPages_HandlesLargeNumbers()
    {
        // Arrange
        var dto = new AuditSearchResultDto
        {
            TotalCount = 1000000,
            PageSize = 50
        };

        // Assert
        dto.TotalPages.Should().Be(20000);
    }

    [Fact]
    public void AuditSearchResultDto_Events_DefaultsToEmptyList()
    {
        // Arrange
        var dto = new AuditSearchResultDto();

        // Assert
        dto.Events.Should().NotBeNull();
        dto.Events.Should().BeEmpty();
    }

    [Fact]
    public void AuditSearchResultDto_AllPropertiesCanBeSet()
    {
        // Arrange
        var events = new List<AuditEventDto>
        {
            new AuditEventDto { Id = Guid.NewGuid() }
        };

        var dto = new AuditSearchResultDto
        {
            Events = events,
            TotalCount = 100,
            PageNumber = 2,
            PageSize = 25
        };

        // Assert
        dto.Events.Should().HaveCount(1);
        dto.TotalCount.Should().Be(100);
        dto.PageNumber.Should().Be(2);
        dto.PageSize.Should().Be(25);
        dto.TotalPages.Should().Be(4);
    }

    [Theory]
    [InlineData(1, 10, 1)]
    [InlineData(10, 10, 1)]
    [InlineData(11, 10, 2)]
    [InlineData(99, 10, 10)]
    [InlineData(100, 10, 10)]
    [InlineData(101, 10, 11)]
    [InlineData(50, 25, 2)]
    [InlineData(51, 25, 3)]
    public void AuditSearchResultDto_TotalPages_CalculatesCorrectlyForVariousInputs(int totalCount, int pageSize, int expectedPages)
    {
        // Arrange
        var dto = new AuditSearchResultDto
        {
            TotalCount = totalCount,
            PageSize = pageSize
        };

        // Assert
        dto.TotalPages.Should().Be(expectedPages);
    }

    #endregion

    #region AuditSearchFilterDto Tests

    [Fact]
    public void AuditSearchFilterDto_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var dto = new AuditSearchFilterDto();

        // Assert
        dto.TenantId.Should().BeNull();
        dto.FromDate.Should().BeNull();
        dto.ToDate.Should().BeNull();
        dto.Category.Should().BeNull();
        dto.Severity.Should().BeNull();
        dto.ActorId.Should().BeNull();
        dto.Action.Should().BeNull();
        dto.PageNumber.Should().Be(1);
        dto.PageSize.Should().Be(50);
    }

    [Fact]
    public void AuditSearchFilterDto_AllPropertiesCanBeSet()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var fromDate = DateTime.UtcNow.AddDays(-7);
        var toDate = DateTime.UtcNow;

        var dto = new AuditSearchFilterDto
        {
            TenantId = tenantId,
            FromDate = fromDate,
            ToDate = toDate,
            Category = AuditCategory.Security,
            Severity = AuditSeverity.Critical,
            ActorId = "user-123",
            Action = "Security.Alert",
            PageNumber = 5,
            PageSize = 100
        };

        // Assert
        dto.TenantId.Should().Be(tenantId);
        dto.FromDate.Should().Be(fromDate);
        dto.ToDate.Should().Be(toDate);
        dto.Category.Should().Be(AuditCategory.Security);
        dto.Severity.Should().Be(AuditSeverity.Critical);
        dto.ActorId.Should().Be("user-123");
        dto.Action.Should().Be("Security.Alert");
        dto.PageNumber.Should().Be(5);
        dto.PageSize.Should().Be(100);
    }

    [Theory]
    [InlineData(AuditCategory.Authentication)]
    [InlineData(AuditCategory.Security)]
    [InlineData(AuditCategory.UserManagement)]
    [InlineData(AuditCategory.ApplicationManagement)]
    [InlineData(AuditCategory.Billing)]
    [InlineData(AuditCategory.Federation)]
    [InlineData(AuditCategory.Scim)]
    [InlineData(AuditCategory.OrganizationManagement)]
    [InlineData(AuditCategory.SystemConfiguration)]
    [InlineData(AuditCategory.AccessControl)]
    public void AuditSearchFilterDto_AcceptsAllCategories(AuditCategory category)
    {
        // Arrange & Act
        var dto = new AuditSearchFilterDto { Category = category };

        // Assert
        dto.Category.Should().Be(category);
    }

    [Theory]
    [InlineData(AuditSeverity.Info)]
    [InlineData(AuditSeverity.Warning)]
    [InlineData(AuditSeverity.Error)]
    [InlineData(AuditSeverity.Critical)]
    public void AuditSearchFilterDto_AcceptsAllSeverities(AuditSeverity severity)
    {
        // Arrange & Act
        var dto = new AuditSearchFilterDto { Severity = severity };

        // Assert
        dto.Severity.Should().Be(severity);
    }

    #endregion

    #region AuditEventDto Tests

    [Fact]
    public void AuditEventDto_DefaultValues_AreEmptyStrings()
    {
        // Arrange & Act
        var dto = new AuditEventDto();

        // Assert
        dto.Id.Should().Be(Guid.Empty);
        dto.TenantId.Should().BeNull();
        dto.CorrelationId.Should().BeEmpty();
        dto.ActorId.Should().BeEmpty();
        dto.ActorDisplayName.Should().BeEmpty();
        dto.ActorType.Should().BeEmpty();
        dto.Action.Should().BeEmpty();
        dto.TargetType.Should().BeEmpty();
        dto.TargetId.Should().BeEmpty();
        dto.IpAddress.Should().BeEmpty();
        dto.UserAgent.Should().BeEmpty();
        dto.Country.Should().BeNull();
        dto.DataJson.Should().BeEmpty();
    }

    [Fact]
    public void AuditEventDto_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var occurredAt = DateTime.UtcNow;

        var dto = new AuditEventDto
        {
            Id = id,
            TenantId = tenantId,
            CorrelationId = "correlation-123",
            Category = AuditCategory.Authentication,
            Severity = AuditSeverity.Info,
            ActorId = "user-456",
            ActorDisplayName = "John Doe",
            ActorType = "User",
            Action = "User.Login",
            TargetType = "Session",
            TargetId = "session-789",
            IpAddress = "192.168.1.1",
            UserAgent = "Mozilla/5.0",
            Country = "US",
            OccurredAt = occurredAt,
            DataJson = "{\"key\":\"value\"}"
        };

        // Assert
        dto.Id.Should().Be(id);
        dto.TenantId.Should().Be(tenantId);
        dto.CorrelationId.Should().Be("correlation-123");
        dto.Category.Should().Be(AuditCategory.Authentication);
        dto.Severity.Should().Be(AuditSeverity.Info);
        dto.ActorId.Should().Be("user-456");
        dto.ActorDisplayName.Should().Be("John Doe");
        dto.ActorType.Should().Be("User");
        dto.Action.Should().Be("User.Login");
        dto.TargetType.Should().Be("Session");
        dto.TargetId.Should().Be("session-789");
        dto.IpAddress.Should().Be("192.168.1.1");
        dto.UserAgent.Should().Be("Mozilla/5.0");
        dto.Country.Should().Be("US");
        dto.OccurredAt.Should().Be(occurredAt);
        dto.DataJson.Should().Be("{\"key\":\"value\"}");
    }

    [Fact]
    public void AuditEventDto_WithNullOptionalProperties_AcceptsNulls()
    {
        // Arrange & Act
        var dto = new AuditEventDto
        {
            Id = Guid.NewGuid(),
            TenantId = null,
            Country = null
        };

        // Assert
        dto.TenantId.Should().BeNull();
        dto.Country.Should().BeNull();
    }

    [Theory]
    [InlineData(AuditCategory.Authentication)]
    [InlineData(AuditCategory.Security)]
    [InlineData(AuditCategory.UserManagement)]
    [InlineData(AuditCategory.ApplicationManagement)]
    [InlineData(AuditCategory.Billing)]
    [InlineData(AuditCategory.Federation)]
    [InlineData(AuditCategory.Scim)]
    [InlineData(AuditCategory.OrganizationManagement)]
    [InlineData(AuditCategory.SystemConfiguration)]
    [InlineData(AuditCategory.AccessControl)]
    public void AuditEventDto_AcceptsAllCategories(AuditCategory category)
    {
        // Arrange & Act
        var dto = new AuditEventDto { Category = category };

        // Assert
        dto.Category.Should().Be(category);
    }

    [Theory]
    [InlineData(AuditSeverity.Info)]
    [InlineData(AuditSeverity.Warning)]
    [InlineData(AuditSeverity.Error)]
    [InlineData(AuditSeverity.Critical)]
    public void AuditEventDto_AcceptsAllSeverities(AuditSeverity severity)
    {
        // Arrange & Act
        var dto = new AuditEventDto { Severity = severity };

        // Assert
        dto.Severity.Should().Be(severity);
    }

    [Fact]
    public void AuditEventDto_WithSpecialCharacters_PreservesCharacters()
    {
        // Arrange & Act
        var dto = new AuditEventDto
        {
            ActorDisplayName = "John O'Brien",
            Action = "User.Update<Script>",
            DataJson = "{\"message\":\"Hello\\nWorld\",\"emoji\":\"\\ud83d\\ude00\"}"
        };

        // Assert
        dto.ActorDisplayName.Should().Be("John O'Brien");
        dto.Action.Should().Be("User.Update<Script>");
        dto.DataJson.Should().Contain("\\n");
    }

    [Fact]
    public void AuditEventDto_WithIPv6Address_AcceptsAddress()
    {
        // Arrange & Act
        var dto = new AuditEventDto
        {
            IpAddress = "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
        };

        // Assert
        dto.IpAddress.Should().Be("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
    }

    [Fact]
    public void AuditEventDto_WithLongUserAgent_AcceptsFullString()
    {
        // Arrange
        var longUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59";

        // Act
        var dto = new AuditEventDto
        {
            UserAgent = longUserAgent
        };

        // Assert
        dto.UserAgent.Should().Be(longUserAgent);
    }

    #endregion

    #region Query DTO Tests

    [Fact]
    public void SearchAuditEventsQuery_Filter_DefaultsToNewInstance()
    {
        // Arrange & Act
        var query = new Onesign.Modules.Observability.Application.Queries.SearchAuditEventsQuery();

        // Assert
        query.Filter.Should().NotBeNull();
        query.Filter.PageNumber.Should().Be(1);
        query.Filter.PageSize.Should().Be(50);
    }

    [Fact]
    public void SearchAuditEventsQuery_Filter_CanBeSet()
    {
        // Arrange
        var filter = new AuditSearchFilterDto
        {
            TenantId = Guid.NewGuid(),
            PageNumber = 3,
            PageSize = 100
        };

        // Act
        var query = new Onesign.Modules.Observability.Application.Queries.SearchAuditEventsQuery
        {
            Filter = filter
        };

        // Assert
        query.Filter.Should().Be(filter);
        query.Filter.PageNumber.Should().Be(3);
        query.Filter.PageSize.Should().Be(100);
    }

    [Fact]
    public void GetAuditEventByIdQuery_Id_CanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();

        // Act
        var query = new Onesign.Modules.Observability.Application.Queries.GetAuditEventByIdQuery
        {
            Id = id
        };

        // Assert
        query.Id.Should().Be(id);
    }

    [Fact]
    public void GetAuditEventByIdQuery_Id_DefaultsToEmptyGuid()
    {
        // Arrange & Act
        var query = new Onesign.Modules.Observability.Application.Queries.GetAuditEventByIdQuery();

        // Assert
        query.Id.Should().Be(Guid.Empty);
    }

    #endregion
}
