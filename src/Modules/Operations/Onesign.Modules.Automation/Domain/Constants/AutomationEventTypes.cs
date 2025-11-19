namespace Onesign.Modules.Automation.Domain.Constants;

/// <summary>
/// Defines all supported automation event types that can trigger workflows.
/// Use these constants when creating triggers for automation workflows.
/// </summary>
public static class AutomationEventTypes
{
    /// <summary>
    /// Authentication-related events
    /// </summary>
    public static class Auth
    {
        /// <summary>Triggered when a user successfully signs in</summary>
        public const string SignInSucceeded = "Auth.SignInSucceeded";

        /// <summary>Triggered when a sign-in attempt fails</summary>
        public const string SignInFailed = "Auth.SignInFailed";

        /// <summary>Triggered when a high-risk sign-in is detected based on risk scoring</summary>
        public const string HighRiskSignInDetected = "Auth.HighRiskSignInDetected";
    }

    /// <summary>
    /// Access request lifecycle events
    /// </summary>
    public static class AccessRequest
    {
        /// <summary>Triggered when a new access request is created</summary>
        public const string Created = "AccessRequest.Created";

        /// <summary>Triggered when an access request is approved</summary>
        public const string Approved = "AccessRequest.Approved";

        /// <summary>Triggered when an access request is rejected</summary>
        public const string Rejected = "AccessRequest.Rejected";
    }

    /// <summary>
    /// Identity lifecycle events (Joiner/Mover/Leaver)
    /// </summary>
    public static class Lifecycle
    {
        /// <summary>Triggered when a new employee joins the organization</summary>
        public const string JoinerCreated = "Lifecycle.JoinerCreated";

        /// <summary>Triggered when an employee changes departments or roles</summary>
        public const string MoverDetected = "Lifecycle.MoverDetected";

        /// <summary>Triggered when an employee leaves the organization</summary>
        public const string LeaverDetected = "Lifecycle.LeaverDetected";
    }

    /// <summary>
    /// Privileged access management events
    /// </summary>
    public static class PrivilegedAccess
    {
        /// <summary>Triggered when Just-In-Time (JIT) access is granted</summary>
        public const string JITGranted = "PrivilegedAccess.JITGranted";

        /// <summary>Triggered when break-glass emergency access is used</summary>
        public const string BreakGlassUsed = "PrivilegedAccess.BreakGlassUsed";
    }

    /// <summary>
    /// Governance and compliance events
    /// </summary>
    public static class Governance
    {
        /// <summary>Triggered when an access review becomes overdue</summary>
        public const string AccessReviewOverdue = "Governance.AccessReviewOverdue";
    }

    /// <summary>
    /// Security insights and analytics events
    /// </summary>
    public static class Insights
    {
        /// <summary>Triggered when tenant risk score exceeds threshold</summary>
        public const string TenantRiskScoreHigh = "Insights.TenantRiskScoreHigh";
    }

    /// <summary>
    /// Gets all supported event types as a list
    /// </summary>
    public static IReadOnlyList<string> GetAllEventTypes() => new[]
    {
        // Auth events
        Auth.SignInSucceeded,
        Auth.SignInFailed,
        Auth.HighRiskSignInDetected,

        // Access Request events
        AccessRequest.Created,
        AccessRequest.Approved,
        AccessRequest.Rejected,

        // Lifecycle events
        Lifecycle.JoinerCreated,
        Lifecycle.MoverDetected,
        Lifecycle.LeaverDetected,

        // Privileged Access events
        PrivilegedAccess.JITGranted,
        PrivilegedAccess.BreakGlassUsed,

        // Governance events
        Governance.AccessReviewOverdue,

        // Insights events
        Insights.TenantRiskScoreHigh
    };

    /// <summary>
    /// Gets event types grouped by module/category
    /// </summary>
    public static IReadOnlyDictionary<string, IReadOnlyList<string>> GetEventTypesByCategory() => new Dictionary<string, IReadOnlyList<string>>
    {
        ["Auth"] = new[] { Auth.SignInSucceeded, Auth.SignInFailed, Auth.HighRiskSignInDetected },
        ["AccessRequest"] = new[] { AccessRequest.Created, AccessRequest.Approved, AccessRequest.Rejected },
        ["Lifecycle"] = new[] { Lifecycle.JoinerCreated, Lifecycle.MoverDetected, Lifecycle.LeaverDetected },
        ["PrivilegedAccess"] = new[] { PrivilegedAccess.JITGranted, PrivilegedAccess.BreakGlassUsed },
        ["Governance"] = new[] { Governance.AccessReviewOverdue },
        ["Insights"] = new[] { Insights.TenantRiskScoreHigh }
    };
}
