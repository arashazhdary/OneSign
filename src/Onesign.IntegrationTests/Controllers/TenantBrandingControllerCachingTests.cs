using System.Net;
using FluentAssertions;
using Onesign.IntegrationTests.Fixtures;

namespace Onesign.IntegrationTests.Controllers;

public class TenantBrandingControllerCachingTests : IClassFixture<InMemoryWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TenantBrandingControllerCachingTests(InMemoryWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetBranding_ReturnsCacheHeaders()
    {
        var tenantId = Guid.NewGuid();
        var response = await _client.GetAsync($"/api/tenant/branding?tenantId={tenantId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Headers.ETag.Should().NotBeNull();
        response.Headers.ETag!.Tag.ToString().Should().NotBeNullOrWhiteSpace();
        response.Headers.CacheControl.Should().NotBeNull();
        response.Content.Headers.LastModified.Should().NotBeNull();
    }

    [Fact]
    public async Task GetBranding_IfNoneMatch_Returns304()
    {
        var tenantId = Guid.NewGuid();
        var first = await _client.GetAsync($"/api/tenant/branding?tenantId={tenantId}");
        first.EnsureSuccessStatusCode();
        var etag = first.Headers.ETag!.Tag;

        var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"/api/tenant/branding?tenantId={tenantId}");
        request.Headers.TryAddWithoutValidation("If-None-Match", etag.ToString());

        var second = await _client.SendAsync(request);

        second.StatusCode.Should().Be(HttpStatusCode.NotModified);
    }
}
