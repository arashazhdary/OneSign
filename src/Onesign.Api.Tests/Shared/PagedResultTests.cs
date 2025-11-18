using FluentAssertions;
using Onesign.Shared.Pagination;
using Xunit;

namespace Onesign.Api.Tests.Shared;

public class PagedResultTests
{
    [Fact]
    public void PagedResult_ShouldCalculateTotalPagesCorrectly()
    {
        // Arrange
        var result = new PagedResult<string>
        {
            Items = new List<string> { "a", "b", "c" },
            TotalCount = 25,
            PageNumber = 1,
            PageSize = 10
        };

        // Assert
        result.TotalPages.Should().Be(3);
    }

    [Fact]
    public void PagedResult_WhenOnFirstPage_HasPreviousPageShouldBeFalse()
    {
        // Arrange
        var result = new PagedResult<int>
        {
            Items = new List<int> { 1, 2, 3 },
            TotalCount = 30,
            PageNumber = 1,
            PageSize = 10
        };

        // Assert
        result.HasPreviousPage.Should().BeFalse();
    }

    [Fact]
    public void PagedResult_WhenOnSecondPage_HasPreviousPageShouldBeTrue()
    {
        // Arrange
        var result = new PagedResult<int>
        {
            Items = new List<int> { 1, 2, 3 },
            TotalCount = 30,
            PageNumber = 2,
            PageSize = 10
        };

        // Assert
        result.HasPreviousPage.Should().BeTrue();
    }

    [Fact]
    public void PagedResult_WhenNotOnLastPage_HasNextPageShouldBeTrue()
    {
        // Arrange
        var result = new PagedResult<int>
        {
            Items = new List<int> { 1, 2, 3 },
            TotalCount = 30,
            PageNumber = 1,
            PageSize = 10
        };

        // Assert
        result.HasNextPage.Should().BeTrue();
    }

    [Fact]
    public void PagedResult_WhenOnLastPage_HasNextPageShouldBeFalse()
    {
        // Arrange
        var result = new PagedResult<int>
        {
            Items = new List<int> { 1, 2, 3 },
            TotalCount = 30,
            PageNumber = 3,
            PageSize = 10
        };

        // Assert
        result.HasNextPage.Should().BeFalse();
    }

    [Fact]
    public void PagedResult_WithExactPageFit_ShouldCalculateTotalPagesCorrectly()
    {
        // Arrange
        var result = new PagedResult<int>
        {
            Items = new List<int> { 1, 2, 3, 4, 5 },
            TotalCount = 20,
            PageNumber = 1,
            PageSize = 5
        };

        // Assert
        result.TotalPages.Should().Be(4);
    }

    [Fact]
    public void PagedResult_WithEmptyItems_ShouldInitializeWithEmptyList()
    {
        // Arrange
        var result = new PagedResult<string>();

        // Assert
        result.Items.Should().NotBeNull();
        result.Items.Should().BeEmpty();
    }

    [Fact]
    public void PagedResult_WithSingleItem_ShouldCalculateCorrectly()
    {
        // Arrange
        var result = new PagedResult<string>
        {
            Items = new List<string> { "single" },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10
        };

        // Assert
        result.TotalPages.Should().Be(1);
        result.HasPreviousPage.Should().BeFalse();
        result.HasNextPage.Should().BeFalse();
    }

    [Fact]
    public void PagedResult_WithZeroTotalCount_ShouldHandleEdgeCase()
    {
        // Arrange
        var result = new PagedResult<int>
        {
            Items = new List<int>(),
            TotalCount = 0,
            PageNumber = 1,
            PageSize = 10
        };

        // Assert
        result.TotalPages.Should().Be(0);
        result.HasPreviousPage.Should().BeFalse();
        result.HasNextPage.Should().BeFalse();
    }

    [Fact]
    public void PagedResult_WithLargeDataset_ShouldCalculateCorrectly()
    {
        // Arrange
        var result = new PagedResult<int>
        {
            Items = Enumerable.Range(1, 100).ToList(),
            TotalCount = 1000,
            PageNumber = 5,
            PageSize = 100
        };

        // Assert
        result.TotalPages.Should().Be(10);
        result.HasPreviousPage.Should().BeTrue();
        result.HasNextPage.Should().BeTrue();
    }

    [Fact]
    public void PagedResult_WithMiddlePage_ShouldHaveBothNavigationOptions()
    {
        // Arrange
        var result = new PagedResult<string>
        {
            Items = new List<string> { "item" },
            TotalCount = 50,
            PageNumber = 3,
            PageSize = 10
        };

        // Assert
        result.TotalPages.Should().Be(5);
        result.HasPreviousPage.Should().BeTrue();
        result.HasNextPage.Should().BeTrue();
    }
}

public class PagedRequestTests
{
    [Fact]
    public void PagedRequest_ShouldHaveDefaultValues()
    {
        // Arrange
        var request = new PagedRequest();

        // Assert
        request.PageNumber.Should().Be(1);
        request.PageSize.Should().Be(10);
    }

    [Fact]
    public void Skip_ShouldCalculateCorrectlyForFirstPage()
    {
        // Arrange
        var request = new PagedRequest
        {
            PageNumber = 1,
            PageSize = 10
        };

        // Assert
        request.Skip.Should().Be(0);
    }

    [Fact]
    public void Skip_ShouldCalculateCorrectlyForSecondPage()
    {
        // Arrange
        var request = new PagedRequest
        {
            PageNumber = 2,
            PageSize = 10
        };

        // Assert
        request.Skip.Should().Be(10);
    }

    [Fact]
    public void Skip_ShouldCalculateCorrectlyForLaterPages()
    {
        // Arrange
        var request = new PagedRequest
        {
            PageNumber = 5,
            PageSize = 20
        };

        // Assert
        request.Skip.Should().Be(80);
    }

    [Fact]
    public void Take_ShouldReturnPageSize()
    {
        // Arrange
        var request = new PagedRequest
        {
            PageNumber = 3,
            PageSize = 25
        };

        // Assert
        request.Take.Should().Be(25);
    }

    [Fact]
    public void PagedRequest_WithCustomValues_ShouldCalculateSkipCorrectly()
    {
        // Arrange
        var request = new PagedRequest
        {
            PageNumber = 10,
            PageSize = 50
        };

        // Assert
        request.Skip.Should().Be(450);
        request.Take.Should().Be(50);
    }

    [Fact]
    public void PagedRequest_WithPageSizeOfOne_ShouldCalculateCorrectly()
    {
        // Arrange
        var request = new PagedRequest
        {
            PageNumber = 100,
            PageSize = 1
        };

        // Assert
        request.Skip.Should().Be(99);
        request.Take.Should().Be(1);
    }
}
