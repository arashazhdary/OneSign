using FluentAssertions;
using Onesign.Api.Infrastructure;
using Onesign.Modules.Tenants.Application.DTOs;

namespace Onesign.Api.Tests.Infrastructure;

public class BrandingHttpCacheHelperTests
{
    [Fact]
    public void ComputeETag_IsStableForSamePayload()
    {
        var tenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var branding = new TenantBrandingDto
        {
            TenantName = "Acme",
            PrimaryColor = "#112233",
        };

        var etag1 = BrandingHttpCacheHelper.ComputeETag(branding, tenantId);
        var etag2 = BrandingHttpCacheHelper.ComputeETag(branding, tenantId);

        etag1.Should().Be(etag2);
        etag1.Should().StartWith("\"").And.EndWith("\"");
    }

    [Fact]
    public void ComputeETag_ChangesWhenBrandingChanges()
    {
        var tenantId = Guid.NewGuid();
        var a = new TenantBrandingDto { TenantName = "A" };
        var b = new TenantBrandingDto { TenantName = "B" };

        BrandingHttpCacheHelper.ComputeETag(a, tenantId)
            .Should().NotBe(BrandingHttpCacheHelper.ComputeETag(b, tenantId));
    }

    [Fact]
    public void MatchesIfNoneMatch_SupportsQuotedAndWeakEtags()
    {
        const string etag = "\"abc123def4567890\"";
        BrandingHttpCacheHelper.MatchesIfNoneMatch(etag, etag).Should().BeTrue();
        BrandingHttpCacheHelper.MatchesIfNoneMatch($"W/{etag}", etag).Should().BeTrue();
        BrandingHttpCacheHelper.MatchesIfNoneMatch("*", etag).Should().BeTrue();
        BrandingHttpCacheHelper.MatchesIfNoneMatch("\"other\"", etag).Should().BeFalse();
    }

    [Fact]
    public void IsNotModifiedSince_ReturnsTrueWhenNotChanged()
    {
        var lastModified = new DateTimeOffset(2025, 5, 1, 12, 0, 0, TimeSpan.Zero);
        var ifModifiedSince = new DateTimeOffset(2025, 5, 1, 13, 0, 0, TimeSpan.Zero);

        BrandingHttpCacheHelper.IsNotModifiedSince(lastModified, ifModifiedSince).Should().BeTrue();
    }
}
