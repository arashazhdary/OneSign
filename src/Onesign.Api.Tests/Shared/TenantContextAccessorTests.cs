using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;
using Onesign.Shared.MultiTenancy;
using Onesign.Shared.Tenant;
using Xunit;

namespace Onesign.Api.Tests.Shared;

public class TenantContextAccessorTests
{
    private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
    private readonly TenantContextAccessor _accessor;

    public TenantContextAccessorTests()
    {
        _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
        _accessor = new TenantContextAccessor(_mockHttpContextAccessor.Object);
    }

    [Fact]
    public void Constructor_WithNullHttpContextAccessor_ShouldThrowArgumentNullException()
    {
        // Act
        Action act = () => new TenantContextAccessor(null!);

        // Assert
        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("httpContextAccessor");
    }

    [Fact]
    public void GetCurrentTenantId_WhenHttpContextIsNull_ShouldReturnNull()
    {
        // Arrange
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void GetCurrentTenantId_WhenTenantContextExistsInItems_ShouldReturnTenantId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var httpContext = new DefaultHttpContext();
        httpContext.Items["TenantContext"] = new TenantContext { TenantId = tenantId };
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().Be(tenantId);
    }

    [Fact]
    public void GetCurrentTenantId_WhenTenantIdGuidExistsInItems_ShouldReturnTenantId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var httpContext = new DefaultHttpContext();
        httpContext.Items["TenantId"] = tenantId;
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().Be(tenantId);
    }

    [Fact]
    public void GetCurrentTenantId_WhenTenantIdStringExistsInItems_ShouldParseTenantId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var httpContext = new DefaultHttpContext();
        httpContext.Items["TenantId"] = tenantId.ToString();
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().Be(tenantId);
    }

    [Fact]
    public void GetCurrentTenantId_WhenTenantIdClaimExists_ShouldReturnClaimValue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var claims = new List<Claim> { new Claim("tenant_id", tenantId.ToString()) };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = principal };
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().Be(tenantId);
    }

    [Fact]
    public void GetCurrentTenantId_WhenInvalidTenantIdString_ShouldReturnNull()
    {
        // Arrange
        var httpContext = new DefaultHttpContext();
        httpContext.Items["TenantId"] = "not-a-guid";
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void GetCurrentTenantId_WhenInvalidClaimValue_ShouldReturnNull()
    {
        // Arrange
        var claims = new List<Claim> { new Claim("tenant_id", "invalid") };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = principal };
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void GetCurrentTenantId_TenantContextTakesPriority_ShouldReturnContextValue()
    {
        // Arrange
        var contextTenantId = Guid.NewGuid();
        var itemTenantId = Guid.NewGuid();

        var httpContext = new DefaultHttpContext();
        httpContext.Items["TenantContext"] = new TenantContext { TenantId = contextTenantId };
        httpContext.Items["TenantId"] = itemTenantId;
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().Be(contextTenantId);
    }

    [Fact]
    public void GetCurrentTenant_WhenHttpContextIsNull_ShouldReturnNull()
    {
        // Arrange
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        // Act
        var result = _accessor.GetCurrentTenant();

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void GetCurrentTenant_WhenTenantContextExists_ShouldReturnContext()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantContext = new TenantContext
        {
            TenantId = tenantId,
            TenantSlug = "test-tenant"
        };

        var httpContext = new DefaultHttpContext();
        httpContext.Items["TenantContext"] = tenantContext;
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenant();

        // Assert
        result.Should().NotBeNull();
        result!.TenantId.Should().Be(tenantId);
        result.TenantSlug.Should().Be("test-tenant");
    }

    [Fact]
    public void GetCurrentTenant_WhenOnlyTenantIdExists_ShouldCreateBasicContext()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var httpContext = new DefaultHttpContext();
        httpContext.Items["TenantId"] = tenantId;
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenant();

        // Assert
        result.Should().NotBeNull();
        result!.TenantId.Should().Be(tenantId);
        result.TenantSlug.Should().BeNull();
    }

    [Fact]
    public void GetCurrentTenant_WhenNoTenantInfo_ShouldReturnNull()
    {
        // Arrange
        var httpContext = new DefaultHttpContext();
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenant();

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void SetCurrentTenant_WhenHttpContextIsNull_ShouldThrowInvalidOperationException()
    {
        // Arrange
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);
        var tenantContext = new TenantContext { TenantId = Guid.NewGuid() };

        // Act
        Action act = () => _accessor.SetCurrentTenant(tenantContext);

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("No HttpContext available to set tenant context");
    }

    [Fact]
    public void SetCurrentTenant_ShouldSetTenantContextInItems()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantContext = new TenantContext
        {
            TenantId = tenantId,
            TenantSlug = "my-tenant"
        };

        var httpContext = new DefaultHttpContext();
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        _accessor.SetCurrentTenant(tenantContext);

        // Assert
        httpContext.Items["TenantContext"].Should().Be(tenantContext);
    }

    [Fact]
    public void SetCurrentTenant_WithTenantId_ShouldSetBothContextAndId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantContext = new TenantContext { TenantId = tenantId };

        var httpContext = new DefaultHttpContext();
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        _accessor.SetCurrentTenant(tenantContext);

        // Assert
        httpContext.Items["TenantContext"].Should().Be(tenantContext);
        httpContext.Items["TenantId"].Should().Be(tenantId);
    }

    [Fact]
    public void SetCurrentTenant_WithoutTenantId_ShouldNotSetTenantIdItem()
    {
        // Arrange
        var tenantContext = new TenantContext { TenantSlug = "my-tenant" };

        var httpContext = new DefaultHttpContext();
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        _accessor.SetCurrentTenant(tenantContext);

        // Assert
        httpContext.Items["TenantContext"].Should().Be(tenantContext);
        httpContext.Items.Should().NotContainKey("TenantId");
    }

    [Fact]
    public void SetCurrentTenant_ShouldOverwriteExistingContext()
    {
        // Arrange
        var oldTenantId = Guid.NewGuid();
        var newTenantId = Guid.NewGuid();

        var httpContext = new DefaultHttpContext();
        httpContext.Items["TenantContext"] = new TenantContext { TenantId = oldTenantId };
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        var newContext = new TenantContext { TenantId = newTenantId };

        // Act
        _accessor.SetCurrentTenant(newContext);

        // Assert
        var storedContext = httpContext.Items["TenantContext"] as TenantContext;
        storedContext!.TenantId.Should().Be(newTenantId);
    }

    [Fact]
    public void GetCurrentTenantId_WhenEmptyClaimValue_ShouldReturnNull()
    {
        // Arrange
        var claims = new List<Claim> { new Claim("tenant_id", string.Empty) };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = principal };
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void GetCurrentTenantId_WithNullUser_ShouldReturnNull()
    {
        // Arrange
        var httpContext = new DefaultHttpContext();
        httpContext.User = null!;
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void TenantContextAccessor_ShouldImplementInterface()
    {
        // Assert
        _accessor.Should().BeAssignableTo<ITenantContextAccessor>();
    }

    [Fact]
    public void GetCurrentTenantId_ItemTakesPriorityOverClaim()
    {
        // Arrange
        var itemTenantId = Guid.NewGuid();
        var claimTenantId = Guid.NewGuid();

        var claims = new List<Claim> { new Claim("tenant_id", claimTenantId.ToString()) };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = principal };
        httpContext.Items["TenantId"] = itemTenantId;
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().Be(itemTenantId);
    }

    [Fact]
    public void GetCurrentTenant_WhenTenantContextHasNullTenantId_ShouldReturnContext()
    {
        // Arrange
        var tenantContext = new TenantContext
        {
            TenantSlug = "slug-only"
        };

        var httpContext = new DefaultHttpContext();
        httpContext.Items["TenantContext"] = tenantContext;
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenant();

        // Assert
        result.Should().NotBeNull();
        result!.TenantId.Should().BeNull();
        result.TenantSlug.Should().Be("slug-only");
    }

    [Fact]
    public void GetCurrentTenantId_WhenItemIsWrongType_ShouldFallbackToClaim()
    {
        // Arrange
        var claimTenantId = Guid.NewGuid();
        var claims = new List<Claim> { new Claim("tenant_id", claimTenantId.ToString()) };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = principal };
        httpContext.Items["TenantId"] = 12345; // Wrong type
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        var result = _accessor.GetCurrentTenantId();

        // Assert
        result.Should().Be(claimTenantId);
    }

    [Fact]
    public void RoundTrip_SetAndGetTenant_ShouldReturnSameValues()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var slug = "test-slug";
        var tenantContext = new TenantContext
        {
            TenantId = tenantId,
            TenantSlug = slug
        };

        var httpContext = new DefaultHttpContext();
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

        // Act
        _accessor.SetCurrentTenant(tenantContext);
        var retrievedContext = _accessor.GetCurrentTenant();
        var retrievedId = _accessor.GetCurrentTenantId();

        // Assert
        retrievedContext.Should().NotBeNull();
        retrievedContext!.TenantId.Should().Be(tenantId);
        retrievedContext.TenantSlug.Should().Be(slug);
        retrievedId.Should().Be(tenantId);
    }
}
