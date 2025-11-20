namespace Onesign.Modules.AdaptiveSecurity.Domain.Enums;

public enum AdaptiveActionType
{
    AllowWithMfa = 1,
    BlockTemporary = 2,
    BlockPermanent = 3,
    RequireApproval = 4,
    NotifyAdmin = 5,
    ApproveRequest = 6
}
