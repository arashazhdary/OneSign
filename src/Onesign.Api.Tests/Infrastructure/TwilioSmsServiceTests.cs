using System.Net;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Onesign.Shared.Sms;
using Xunit;

namespace Onesign.Api.Tests.Infrastructure;

public class TwilioSmsServiceTests
{
    [Fact]
    public async Task SendSmsAsync_SuccessResponse_ReturnsTrue()
    {
        var handler = new StubHttpHandler(_ => new HttpResponseMessage(HttpStatusCode.Created));
        var httpClient = new HttpClient(handler);
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Sms:Twilio:AccountSid"] = "ACtest",
                ["Sms:Twilio:AuthToken"] = "secret",
                ["Sms:Twilio:FromNumber"] = "+15550001111",
            })
            .Build();

        var service = new TwilioSmsService(httpClient, config, NullLogger<TwilioSmsService>.Instance);

        var sent = await service.SendSmsAsync("+15550002222", "Your code is 123456");

        sent.Should().BeTrue();
        handler.LastRequest.Should().NotBeNull();
        handler.LastRequest!.RequestUri!.ToString().Should().Contain("ACtest/Messages.json");
    }

    [Fact]
    public async Task SendSmsAsync_MissingConfig_ReturnsFalse()
    {
        var service = new TwilioSmsService(
            new HttpClient(),
            new ConfigurationBuilder().Build(),
            NullLogger<TwilioSmsService>.Instance);

        var sent = await service.SendSmsAsync("+1", "test");
        sent.Should().BeFalse();
    }

    private sealed class StubHttpHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _responder;

        public HttpRequestMessage? LastRequest { get; private set; }

        public StubHttpHandler(Func<HttpRequestMessage, HttpResponseMessage> responder)
        {
            _responder = responder;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            LastRequest = request;
            return Task.FromResult(_responder(request));
        }
    }
}
