namespace Onesign.Modules.Security.Application.DTOs;

public class MfaChallengeRequest
{
    public Guid UserId { get; set; }
    public int? PreferredMethodType { get; set; }
}
