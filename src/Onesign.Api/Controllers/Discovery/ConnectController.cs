using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Onesign.Api.Data;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Modules.Identity.Infrastructure.Security;

namespace Onesign.Api.Controllers.Discovery;

[ApiController]
[Route("connect")]
public class ConnectController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IApplicationClientRepository _applicationClientRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly OnesignDbContext _dbContext;

    public ConnectController(
        IAuthService authService,
        IApplicationClientRepository applicationClientRepository,
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        OnesignDbContext dbContext)
    {
        _authService = authService;
        _applicationClientRepository = applicationClientRepository;
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
        _dbContext = dbContext;
    }

    [HttpGet("authorize")]
    public async Task<ActionResult> Authorize(
        [FromQuery] string client_id,
        [FromQuery] string redirect_uri,
        [FromQuery] string response_type,
        [FromQuery] string scope,
        [FromQuery] string state,
        [FromQuery] string code_challenge,
        [FromQuery] string code_challenge_method,
        [FromQuery] Guid? tenantId)
    {
        // Validate required parameters
        if (string.IsNullOrEmpty(client_id) || string.IsNullOrEmpty(redirect_uri) || 
            string.IsNullOrEmpty(response_type) || string.IsNullOrEmpty(code_challenge) ||
            string.IsNullOrEmpty(code_challenge_method))
        {
            return BadRequest(new { error = "invalid_request", error_description = "Missing required parameters" });
        }

        if (response_type != "code")
        {
            return BadRequest(new { error = "unsupported_response_type", error_description = "Only 'code' response type is supported" });
        }

        if (code_challenge_method != "S256")
        {
            return BadRequest(new { error = "invalid_request", error_description = "Only S256 code challenge method is supported" });
        }

        // Validate application client
        var applicationClient = await _applicationClientRepository.GetByClientIdAsync(client_id);
        if (applicationClient == null)
        {
            return BadRequest(new { error = "invalid_client", error_description = "Invalid client_id" });
        }

        // Validate redirect URI
        if (!redirect_uri.StartsWith("http://") && !redirect_uri.StartsWith("https://"))
        {
            return BadRequest(new { error = "invalid_request", error_description = "Invalid redirect_uri" });
        }

        // Check against stored redirect URIs for this client
        var storedUris = await _dbContext.Set<ClientRedirectUriEntity>()
            .Where(x => x.ApplicationClientId == applicationClient.Id)
            .Select(x => x.Uri)
            .ToListAsync();

        if (storedUris.Count > 0 && !storedUris.Contains(redirect_uri))
        {
            return BadRequest(new { error = "invalid_request", error_description = "Redirect URI not registered for this client" });
        }

        // Check if user is authenticated via session
        Guid? tenantUserId = null;
        
        // Try to get from session first
        var sessionUserId = HttpContext.Session.GetString("TenantUserId");
        if (!string.IsNullOrEmpty(sessionUserId) && Guid.TryParse(sessionUserId, out var sessionUserIdGuid))
        {
            tenantUserId = sessionUserIdGuid;
        }
        
        // Fallback to JWT claim if session not available
        if (!tenantUserId.HasValue)
        {
            var userIdClaim = User.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var claimUserId))
            {
                tenantUserId = claimUserId;
            }
        }
        
        if (!tenantUserId.HasValue)
        {
            // Store OIDC parameters in session for after login redirect
            HttpContext.Session.SetString("OidcClientId", client_id);
            HttpContext.Session.SetString("OidcRedirectUri", redirect_uri);
            if (!string.IsNullOrEmpty(state))
                HttpContext.Session.SetString("OidcState", state);
            if (!string.IsNullOrEmpty(code_challenge))
                HttpContext.Session.SetString("OidcCodeChallenge", code_challenge);
            if (!string.IsNullOrEmpty(code_challenge_method))
                HttpContext.Session.SetString("OidcCodeChallengeMethod", code_challenge_method);
            
            // Redirect to login portal
            var loginUrl = $"/login?client_id={client_id}&redirect_uri={Uri.EscapeDataString(redirect_uri)}&state={Uri.EscapeDataString(state ?? "")}&code_challenge={code_challenge}&code_challenge_method={code_challenge_method}";
            return Redirect(loginUrl);
        }

        // Get tenant user
        var tenantUser = await _tenantUserRepository.GetByIdAsync(tenantUserId.Value);
        if (tenantUser == null || tenantUser.Status != Onesign.Modules.Identity.Domain.Enums.TenantUserStatus.Active)
        {
            return Unauthorized(new { error = "access_denied", error_description = "User not found or inactive" });
        }

        // Generate authorization code
        var authCode = await _authService.GenerateAuthorizationCodeAsync(
            tenantUserId.Value,
            applicationClient.Id,
            redirect_uri,
            code_challenge);
        
        // Clear OIDC session data
        HttpContext.Session.Remove("OidcClientId");
        HttpContext.Session.Remove("OidcRedirectUri");
        HttpContext.Session.Remove("OidcState");
        HttpContext.Session.Remove("OidcCodeChallenge");
        HttpContext.Session.Remove("OidcCodeChallengeMethod");

        // Redirect back with authorization code
        var redirectUrl = $"{redirect_uri}?code={authCode}&state={Uri.EscapeDataString(state ?? "")}";
        return Redirect(redirectUrl);
    }

    [HttpPost("token")]
    public async Task<ActionResult> Token([FromForm] TokenRequest request)
    {
        // Validate grant type
        if (request.grant_type != "authorization_code")
        {
            return BadRequest(new { error = "unsupported_grant_type", error_description = "Only authorization_code grant type is supported" });
        }

        // Validate required parameters
        if (string.IsNullOrEmpty(request.code) || string.IsNullOrEmpty(request.code_verifier) ||
            string.IsNullOrEmpty(request.client_id) || string.IsNullOrEmpty(request.redirect_uri))
        {
            return BadRequest(new { error = "invalid_request", error_description = "Missing required parameters" });
        }

        // Validate and consume authorization code
        var codeData = await _authService.ValidateAuthorizationCodeAsync(request.code);
        if (codeData == null)
        {
            return BadRequest(new { error = "invalid_grant", error_description = "Invalid or expired authorization code" });
        }

        // Validate application client
        var applicationClient = await _applicationClientRepository.GetByClientIdAsync(request.client_id);
        if (applicationClient == null || applicationClient.Id != codeData.Value.ClientId)
        {
            return BadRequest(new { error = "invalid_client", error_description = "Invalid client_id" });
        }

        // Validate redirect URI
        if (request.redirect_uri != codeData.Value.RedirectUri)
        {
            return BadRequest(new { error = "invalid_grant", error_description = "Redirect URI mismatch" });
        }

        // Verify PKCE code challenge
        if (!PkceHelper.VerifyCodeChallenge(request.code_verifier, codeData.Value.CodeChallenge))
        {
            return BadRequest(new { error = "invalid_grant", error_description = "Invalid code_verifier" });
        }

        // Get tenant user
        var tenantUser = await _tenantUserRepository.GetByIdAsync(codeData.Value.TenantUserId);
        if (tenantUser == null)
        {
            return BadRequest(new { error = "invalid_grant", error_description = "User not found" });
        }

        // Get global user for email
        var globalUser = await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId);
        var email = globalUser?.Email;

        // Generate tokens
        var accessToken = await _authService.GenerateAccessTokenAsync(
            tenantUser.Id,
            tenantUser.TenantId,
            applicationClient.Id);

        var idToken = await _authService.GenerateIdTokenAsync(
            tenantUser.Id,
            tenantUser.TenantId,
            applicationClient.Id,
            email);

        // Return token response
        return Ok(new
        {
            access_token = accessToken,
            token_type = "Bearer",
            expires_in = 3600,
            id_token = idToken
        });
    }
}

public class TokenRequest
{
    public string grant_type { get; set; } = string.Empty;
    public string code { get; set; } = string.Empty;
    public string redirect_uri { get; set; } = string.Empty;
    public string client_id { get; set; } = string.Empty;
    public string code_verifier { get; set; } = string.Empty;
}

