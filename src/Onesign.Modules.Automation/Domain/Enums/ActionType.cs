namespace Onesign.Modules.Automation.Domain.Enums;

public enum ActionType
{
    RevokeSessions = 0,
    RequireMfaNextSignIn = 1,
    LockUserAccount = 2,
    DisableAppAccess = 3,
    TriggerAccessReview = 4,
    SendEmail = 5,
    SendToChannel = 6,
    InvokeWebhook = 7,
    PushEventToQueue = 8
}
