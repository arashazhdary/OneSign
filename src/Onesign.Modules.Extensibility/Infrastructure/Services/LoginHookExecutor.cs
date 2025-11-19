using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Extensibility.Domain.Enums;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Modules.Extensibility.Domain.Services;

namespace Onesign.Modules.Extensibility.Infrastructure.Services;

public class LoginHookExecutor : ILoginHookExecutor
{
    private readonly ILoginHookRepository _hookRepository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<LoginHookExecutor> _logger;

    public LoginHookExecutor(
        ILoginHookRepository hookRepository,
        IHttpClientFactory httpClientFactory,
        ILogger<LoginHookExecutor> logger)
    {
        _hookRepository = hookRepository;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<LoginHookResult> ExecutePreLoginHooksAsync(
        Guid tenantId,
        LoginHookContext context,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteHooksAsync(tenantId, HookStage.PreLogin, context, cancellationToken);
    }

    public async Task<LoginHookResult> ExecutePostLoginHooksAsync(
        Guid tenantId,
        LoginHookContext context,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteHooksAsync(tenantId, HookStage.PostLogin, context, cancellationToken);
    }

    private async Task<LoginHookResult> ExecuteHooksAsync(
        Guid tenantId,
        HookStage stage,
        LoginHookContext context,
        CancellationToken cancellationToken)
    {
        var hooks = await _hookRepository.GetByTenantAndStageAsync(tenantId, stage, cancellationToken);
        var enabledHooks = hooks.Where(h => h.IsEnabled).ToList();

        if (!enabledHooks.Any())
        {
            return new LoginHookResult
            {
                IsSuccess = true,
                ShouldContinue = true
            };
        }

        var result = new LoginHookResult
        {
            IsSuccess = true,
            ShouldContinue = true,
            ModifiedClaims = new Dictionary<string, object>(context.Claims)
        };

        foreach (var hook in enabledHooks)
        {
            try
            {
                var hookResult = await ExecuteHookAsync(hook.Id, hook.EndpointUrl, hook.Secret,
                    hook.TimeoutSeconds, context, cancellationToken);

                if (!hookResult.IsSuccess)
                {
                    if (hook.FailOpen)
                    {
                        _logger.LogWarning("Hook {HookId} failed but configured to fail-open", hook.Id);
                        continue;
                    }
                    else
                    {
                        result.IsSuccess = false;
                        result.ShouldContinue = false;
                        result.ErrorMessage = hookResult.ErrorMessage;
                        return result;
                    }
                }

                if (!hookResult.ShouldContinue)
                {
                    result.ShouldContinue = false;
                    result.ErrorMessage = hookResult.ErrorMessage;
                    return result;
                }

                // Merge modified claims
                foreach (var claim in hookResult.ModifiedClaims)
                {
                    result.ModifiedClaims[claim.Key] = claim.Value;
                }

                // Merge additional metadata
                foreach (var meta in hookResult.AdditionalMetadata)
                {
                    result.AdditionalMetadata[meta.Key] = meta.Value;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing hook {HookId}", hook.Id);

                if (!hook.FailOpen)
                {
                    result.IsSuccess = false;
                    result.ShouldContinue = false;
                    result.ErrorMessage = $"Hook execution failed: {ex.Message}";
                    return result;
                }
            }
        }

        return result;
    }

    private async Task<LoginHookResult> ExecuteHookAsync(
        Guid hookId,
        string endpointUrl,
        string secret,
        int timeoutSeconds,
        LoginHookContext context,
        CancellationToken cancellationToken)
    {
        var httpClient = _httpClientFactory.CreateClient();
        httpClient.Timeout = TimeSpan.FromSeconds(timeoutSeconds);

        var payload = JsonSerializer.Serialize(new
        {
            HookId = hookId,
            Timestamp = DateTime.UtcNow,
            User = new
            {
                context.UserId,
                context.Username
            },
            Context = new
            {
                context.IpAddress,
                context.UserAgent,
                context.DeviceId
            },
            Claims = context.Claims,
            Metadata = context.Metadata
        });

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var signature = ComputeHmacSignature(timestamp, payload, secret);

        var request = new HttpRequestMessage(HttpMethod.Post, endpointUrl)
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json")
        };

        request.Headers.Add("X-Hook-Id", hookId.ToString());
        request.Headers.Add("X-Hook-Timestamp", timestamp);
        request.Headers.Add("X-Hook-Signature", $"sha256={signature}");

        try
        {
            var response = await httpClient.SendAsync(request, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var hookResponse = JsonSerializer.Deserialize<HookResponse>(responseContent,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return new LoginHookResult
                {
                    IsSuccess = true,
                    ShouldContinue = hookResponse?.Continue ?? true,
                    ErrorMessage = hookResponse?.Error,
                    ModifiedClaims = hookResponse?.Claims ?? new Dictionary<string, object>(),
                    AdditionalMetadata = hookResponse?.Metadata ?? new Dictionary<string, object>()
                };
            }
            else
            {
                return new LoginHookResult
                {
                    IsSuccess = false,
                    ShouldContinue = false,
                    ErrorMessage = $"Hook returned {response.StatusCode}: {responseContent}"
                };
            }
        }
        catch (TaskCanceledException)
        {
            return new LoginHookResult
            {
                IsSuccess = false,
                ShouldContinue = false,
                ErrorMessage = "Hook request timed out"
            };
        }
        catch (Exception ex)
        {
            return new LoginHookResult
            {
                IsSuccess = false,
                ShouldContinue = false,
                ErrorMessage = ex.Message
            };
        }
    }

    private static string ComputeHmacSignature(string timestamp, string payload, string secret)
    {
        var signaturePayload = $"{timestamp}.{payload}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(signaturePayload));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private class HookResponse
    {
        public bool Continue { get; set; } = true;
        public string? Error { get; set; }
        public Dictionary<string, object> Claims { get; set; } = new();
        public Dictionary<string, object> Metadata { get; set; } = new();
    }
}
