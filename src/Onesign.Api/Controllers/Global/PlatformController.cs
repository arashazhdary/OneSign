using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Platform.Application.Commands;
using Onesign.Modules.Platform.Application.Queries;
using Microsoft.Extensions.DependencyInjection;

namespace Onesign.Api.Controllers.Global;

[ApiController]
[Route("api/global/platform")]
[Authorize(Roles = "GlobalAdmin,PlatformOwner")]
public class PlatformController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PlatformController> _logger;

    public PlatformController(IMediator mediator, ILogger<PlatformController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Gets the current platform version information
    /// </summary>
    [HttpGet("version")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVersion()
    {
        var query = new GetPlatformVersionQuery();
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(new { Error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets the platform health status
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHealth()
    {
        var query = new GetPlatformHealthQuery();
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(new { Error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets the list of database migrations with optional filtering
    /// </summary>
    [HttpGet("migrations")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMigrations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null)
    {
        var query = new Onesign.Modules.Platform.Application.Queries.GetMigrationHistoryQuery
        {
            Page = page,
            PageSize = pageSize,
            Status = status
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(new { Error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Applies pending database migrations
    /// </summary>
    [HttpPost("migrations/apply")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApplyMigration([FromBody] ApplyMigrationCommand command)
    {
        if (command == null)
        {
            return BadRequest(new { Error = "Command cannot be null" });
        }

        _logger.LogInformation("Applying migration: {MigrationName}, UserId: {UserId}",
            command.MigrationName, command.UserId);

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(new { Error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets platform diagnostics information
    /// </summary>
    [HttpGet("diagnostics")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDiagnostics()
    {
        var query = new Onesign.Modules.Platform.Application.Queries.GetDiagnosticsQuery();
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(new { Error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Runs integration tests for the platform
    /// </summary>
    [HttpPost("tests/run")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RunIntegrationTests([FromBody] RunIntegrationTestsCommand command)
    {
        if (command == null)
        {
            command = new RunIntegrationTestsCommand();
        }

        // ExecutedBy is not a property of RunIntegrationTestsCommand

        _logger.LogInformation("Running integration tests: TestSuiteId={TestSuiteId}, Categories={Categories}",
            command.TestSuiteId, string.Join(",", command.Categories ?? new List<string>()));

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(new { Error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets a specific test result by ID
    /// </summary>
    [HttpGet("tests/{testId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTestResult(Guid testId)
    {
        var query = new Onesign.Modules.Platform.Application.Queries.GetIntegrationTestResultByIdQuery { Id = testId };
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return NotFound(new { Error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets paginated test results history
    /// </summary>
    [HttpGet("tests/results")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTestResults(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = new Onesign.Modules.Platform.Application.Queries.GetIntegrationTestResultsQuery
        {
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
        {
            return BadRequest(new { Error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets the OpenAPI specification for the platform
    /// </summary>
    [HttpGet("docs/openapi")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOpenApiSpec()
    {
        // Use service directly instead of query
        var apiDocService = HttpContext.RequestServices.GetRequiredService<Onesign.Shared.Platform.Services.IApiDocumentationService>();
        var spec = await apiDocService.GetOpenApiSpecificationAsync();
        return Ok(spec);
    }

    /// <summary>
    /// Generates or regenerates platform documentation
    /// </summary>
    [HttpPost("docs/generate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateDocumentation()
    {
        var command = new Onesign.Modules.Platform.Application.Commands.GenerateApiDocumentationCommand
        {
            IncludeExamples = true
        };

        _logger.LogInformation("Generating documentation");

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return BadRequest(new { Error = result.ErrorMessage });
        }

        return Ok(result.Value);
    }
}
