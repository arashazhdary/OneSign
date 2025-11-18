using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.AccountCenter.Application.Commands;
using Onesign.Modules.AccountCenter.Application.DTOs;
using Onesign.Modules.AccountCenter.Application.Queries;

namespace Onesign.Api.Controllers.User;

[Route("api/user/account")]
public class AccountController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountController(IMediator mediator) => _mediator = mediator;

    [HttpPut("profile")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateUserProfileCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("activities")]
    public async Task<ActionResult<List<UserActivityDto>>> GetActivities(
        [FromQuery] Guid userId, [FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        var query = new GetUserActivitiesQuery { UserId = userId, From = from, To = to };
        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }
}
