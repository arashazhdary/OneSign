You are a senior software architect and staff-level engineer working on the onesign platform:

- Multi-tenant SSO / IAM / IGA SaaS
- Backend: .NET 10, modular monolith, Clean Architecture, per-module boundaries
- Frontend: React / Next.js (Admin Portal: Global + Tenant, Login Portal, DevPortal, Account Center)
- Full multi-language support (English LTR as primary, Persian RTL as secondary) in UI

Previous phases (1–26) have already implemented, among others:
- Core SSO, OIDC/OAuth2, OrgUnits, Authorization (RBAC/ABAC)
- Federation, SCIM, AccessRequests, IdentityLifecycle
- PrivilegedAccess, AdaptiveSecurity, Governance, DevPortal
- NotificationCenter, Observability/Insights, MultiRegion DR
- Environment & On-Prem/Hybrid, Crypto, Privacy & DSR
- Phase 25: Insights & Reporting Center
- Phase 26: Automation & Playbooks Center (event-driven workflows with actions)

Your job now is to DESIGN AND IMPLEMENT **Phase 27: Change Management & Policy Simulation Center** as a production-grade feature.

This phase is about **safe change**:
- Before changing security policies, automation playbooks, tenant security settings, federation or app configs, admins must:
  - Propose changes as a ChangeSet
  - Simulate impact
  - Get approvals
  - Optionally schedule rollout
  - Have a clear rollback path

You must NOT leave TODOs or “later” stubs. Everything must work end-to-end.

==================================================
HIGH LEVEL – WHAT PHASE 27 IS
==================================================

Goal: prevent “fat-finger” disasters in a complex IAM/SSO platform.

Phase 27 introduces a **Change Management & Policy Simulation Center**:

- All high-impact config changes (policies, automation workflows, tenant security settings, app SSO config) flow through ChangeSets.
- Each ChangeSet:
  - has a scope (Tenant / Global)
  - contains one or more ChangeItems (add/update/remove)
  - supports Draft → InReview → Approved → Scheduled → Applied → RolledBack / Cancelled lifecycle
  - can be simulated:
    - “Which users will lose access?”
    - “Which users will now require MFA?”
    - “Which automation workflows will start firing more often?”
  - writes detailed audit logs.

Types of changes (initial subset you MUST support in this phase):

1) **Authorization & Security policy changes**
   - e.g. turning on “MFA required for all privileged roles”
   - tightening IP restrictions
   - changing ABAC rules

2) **Automation workflow changes (Phase 26)**
   - enabling/disabling workflows
   - changing conditions/actions of a workflow

3) **Tenant security settings**
   - e.g. default timeout, high risk thresholds, login throttling settings
   - config that affects many users at once

We focus on these domains in Phase 27; you must design it so it can be extended later to more areas (federation, app configs, etc.).

==================================================
GLOBAL RULES (MUST FOLLOW)
==================================================

1) No TODO, no half implementation
- No TODO comments, no NotImplementedException.
- No fake “simulation” that just returns “OK”.
- Every ChangeSet that can be “Applied” must actually change underlying config.

2) Respect modular monolith architecture
- Implement a dedicated module, e.g.:
  - `Onesign.Modules.ChangeManagement`
- Domain/Application/Infrastructure/API layers must follow existing patterns.

3) Strict multi-tenant behavior
- Tenant-scoped changes are always limited to that tenant.
- Global changes are distinct and clearly marked.
- No cross-tenant leaks in ChangeSets, simulations, or history.

4) Security & approvals
- Managing ChangeSets is a privileged operation.
- Some changes MUST require more than one approver (e.g., global policy changes).
- You must wire in roles/permissions appropriately.

5) Audit & compliance
- Every step of a ChangeSet lifecycle must be auditable:
  - who created, who approved, who applied, who rolled back, what changed.

6) Multi-language UI
- Any UI you touch/add MUST use the existing i18n infrastructure.
- No hard-coded English strings in React.

==================================================
CORE CONCEPTS YOU MUST IMPLEMENT
==================================================

Phase 27 introduces these core concepts:

1) **ChangeSet**
   - The container for a set of config changes.

2) **ChangeItem**
   - A single atomic change inside a ChangeSet:
     - e.g. “Update policy X to version v2”
     - “Enable automation workflow Y”
     - “Update tenant security config Z”.

3) **SimulationResult**
   - The predicted impact of applying a ChangeSet:
     - #users losing or gaining access
     - #apps affected
     - risk posture change (based on Insights)
     - potential Automation workflows impacted

4) **Approval workflow**
   - ChangeSet has a state:
     - Draft → InReview → Approved → Scheduled → Applied → RolledBack / Cancelled
   - Optional multiple approvers for specific scopes.

5) **Execution & rollback**
   - Apply = actually change underlying config.
   - Rollback = restore previous configuration state (or as close as reasonably possible with versioning).

==================================================
BACKEND – DATA MODEL (YOU MUST IMPLEMENT)
==================================================

Create a module `Onesign.Modules.ChangeManagement` with at least these entities (names can adapt to your naming conventions but semantics must be preserved):

1) ChangeSet

- Id (Guid)
- ScopeType (string)              // "Tenant" or "Global"
- ScopeId (Guid?)                 // TenantId for tenant scope; null for global
- Title (string)
- Description (string?)
- Category (string)               // e.g. "AuthorizationPolicy", "AutomationWorkflow", "TenantSecuritySettings"
- Status (string)                 // "Draft", "InReview", "Approved", "Scheduled", "Applied", "RolledBack", "Cancelled"
- RequestedByUserId (Guid)
- CreatedAt (DateTimeOffset)
- UpdatedAt (DateTimeOffset?)

- ApprovedByUserId (Guid?)        // last approver
- ApprovedAt (DateTimeOffset?)
- ScheduledFor (DateTimeOffset?)  // if scheduled
- AppliedAt (DateTimeOffset?)
- RolledBackAt (DateTimeOffset?)
- RollbackReason (string?)

- SimulationSummaryJson (string?) // short summary of SimulationResult

Table name example: `ChangeMgmt_ChangeSets`.

2) ChangeItem

Represents one atomic change in the ChangeSet.

- Id (Guid)
- ChangeSetId (Guid, FK)
- TargetType (string)             // "Policy", "AutomationWorkflow", "TenantSetting"
- TargetId (string)               // e.g. policy id, workflow id, key name
- Operation (string)              // "Create", "Update", "Delete", "Enable", "Disable"
- CurrentValueJson (string?)      // snapshot of current config (for rollback)
- ProposedValueJson (string?)     // new config or operation details
- Order (int)                     // order of apply

Table: `ChangeMgmt_ChangeItems`.

3) ChangeApprovalRule (optional but recommended)

Represents per-scope rules for required approvals.

- Id (Guid)
- ScopeType ("Tenant" / "Global")
- ScopeId (Guid?)                 // null for global defaults
- Category (string)               // "AuthorizationPolicy", etc.
- MinApprovers (int)              // minimum required approvers
- RequireSeparationOfDuties (bool) // e.g. requester cannot be approver

Table: `ChangeMgmt_ApprovalRules`.

4) ChangeApproval

- Id (Guid)
- ChangeSetId (Guid, FK)
- ApproverUserId (Guid)
- Decision (string)               // "Approved", "Rejected"
- Reason (string?)
- DecidedAt (DateTimeOffset)

Table: `ChangeMgmt_Approvals`.

5) ChangeExecutionLog

- Id (Guid)
- ChangeSetId (Guid, FK)
- ItemId (Guid, nullable)         // which ChangeItem, if applicable
- Step (string)                   // "Simulate", "Apply", "Rollback"
- Status (string)                 // "Succeeded", "Failed"
- Message (string?)
- CreatedAt (DateTimeOffset)

Table: `ChangeMgmt_ExecutionLogs`.

You MUST:

- Create EF Core mappings & migrations.
- Add indexes on ScopeType, ScopeId, Category, Status.
- Enforce constraints so you cannot accidentally apply a ChangeSet twice.

==================================================
BACKEND – SIMULATION ENGINE
==================================================

Implement a **Simulation Engine** that can estimate the impact of a ChangeSet before applying it.

1) Responsibilities

Given:
- a ChangeSet (with ChangeItems)
- its scope (Tenant/Global)

The engine must:

- For each ChangeItem:
  - Look at TargetType and Operation.
  - Load current config from relevant module:
    - For TargetType = "Policy":
      - From Authorization/Policy module.
    - For TargetType = "AutomationWorkflow":
      - From Automation module (Phase 26).
    - For TargetType = "TenantSetting":
      - From tenant settings module.

  - Compute expected impact using:
    - Authorization and org structure:
      - impacted users and apps (e.g., which users lose/gain access)
    - Insights (Phase 25):
      - changes to risk metrics (e.g., more MFA, less surface)
    - Automation:
      - whether some workflows will start/stop firing or change behavior (high-level).

- Aggregate the impact into a SimulationResult object:
  - counts and basic breakdown:
    - impactedUsersCount
    - impactedAppsCount
    - privilegedUsersAffectedCount
    - policiesAffected
    - automationWorkflowsAffected
    - rough riskDirection ("RiskIncrease", "RiskDecrease", "Neutral")

2) Data returned to caller

SimulationResult should be serialized and stored in:

- ChangeSet.SimulationSummaryJson
- And returned by simulation APIs (see below).

Simulation MUST NOT be a dummy stub. It needs to at least:

- For Policy changes:
  - compute which users/groups/roles would be granted or revoked access to key apps.
- For AutomationWorkflow changes:
  - indicate which workflows are being enabled/disabled or conditionally tightened or relaxed.
- For TenantSecuritySetting changes:
  - indicate which users will be subject to stricter controls (e.g. more MFA, shorter timeouts).

If full exact computation is too heavy, you may approximate but must base it on real queries against existing modules.

==================================================
BACKEND – CHANGESET LIFECYCLE & EXECUTION
==================================================

Implement a lifecycle for ChangeSets:

Status flow:

- Draft
- InReview
- Approved
- (Optional) Scheduled
- Applied
- RolledBack OR Cancelled

Rules:

1) Draft
- Created by a requester.
- Editable: items can be added/removed/modified.
- Can be submitted for review → status InReview.

2) InReview
- Approvers can approve or reject.
- When approvals meet the MinApprovers rule:
  - status moves to Approved.
- If rejected:
  - status = Cancelled.

3) Approved
- Can either:
  - be applied immediately: “Apply now”
  - or scheduled for future: “Schedule at time T”
- Changing items is NOT allowed anymore (only metadata).

4) Scheduled
- At ScheduledFor time, the system:
  - automatically applies the ChangeSet.
- On success:
  - status = Applied.
- On failure:
  - status might go to Failed/Cancelled with logs, but you must handle gracefully.

5) Applied
- Changes have been applied to underlying modules.
- Rollback is possible if CurrentValueJson snapshots support it.

6) RolledBack
- Rollback uses CurrentValueJson in ChangeItems to restore previous state as best as possible.
- The system logs success/failures per item.

==================================================
BACKEND – APPLY & ROLLBACK IMPLEMENTATION
==================================================

1) ApplyChangeSet

For each ChangeItem in order:

- Determine TargetType + Operation.
- For TargetType = "Policy":
  - If Operation = "Update":
    - CurrentValueJson contains old policy definition/version.
    - ProposedValueJson contains new policy definition.
    - Use existing Authorization/Policy service to apply the change.
  - If "Create" or "Delete", use proper service calls.

- For TargetType = "AutomationWorkflow":
  - Use Automation module APIs/services to update workflow definitions.

- For TargetType = "TenantSetting":
  - Update security settings using existing tenant configuration service.

The Apply step:

- Must be transactional per ChangeItem (and as much as possible per ChangeSet).
- Must write ChangeExecutionLog entries for each item.

2) RollbackChangeSet

- Only allowed for ChangeSets in Applied (or partially applied with clear semantics).
- For each ChangeItem:
  - Use CurrentValueJson to restore old state.
  - Some operations (like Delete) may not be perfectly reversible if external side effects exist; in that case:
    - Do the best possible rollback.
    - Log clearly what was and was not restored.

==================================================
BACKEND – APIS YOU MUST IMPLEMENT
==================================================

You need two API surfaces: Tenant-level and Global-level Change Management.

1) Tenant Change Management APIs

Base: `/api/tenant/change-sets`

Implement:

- `GET /api/tenant/change-sets?status=&category=&page=&pageSize=`
  - List ChangeSets for this tenant.

- `GET /api/tenant/change-sets/{id}`
  - Full details: ChangeSet + ChangeItems + Approvals + basic execution log summary.

- `POST /api/tenant/change-sets`
  - Create a new Draft ChangeSet with initial items.

- `PUT /api/tenant/change-sets/{id}`
  - Update a Draft ChangeSet (title, description, items).

- `POST /api/tenant/change-sets/{id}/submit`
  - Move from Draft to InReview.

- `POST /api/tenant/change-sets/{id}/simulate`
  - Run SimulationEngine on the ChangeSet.
  - Store SimulationSummaryJson.
  - Return SimulationResult to caller.

- `POST /api/tenant/change-sets/{id}/approve`
  - Called by an approver:
    - body may optionally include `reason`.
  - Creates ChangeApproval record.
  - If MinApprovers reached → status = Approved.

- `POST /api/tenant/change-sets/{id}/reject`
  - Approver rejects:
    - status = Cancelled (or Rejected).
    - record ChangeApproval with Decision = Rejected.

- `POST /api/tenant/change-sets/{id}/schedule`
  - Set ScheduledFor and status = Scheduled.

- `POST /api/tenant/change-sets/{id}/apply`
  - Immediate apply (if Approved).
  - Calls ApplyChangeSet logic.

- `POST /api/tenant/change-sets/{id}/rollback`
  - Attempt rollback.
  - Only when Applied (or with clearly documented constraint).

- `GET /api/tenant/change-sets/{id}/execution-log`
  - Returns ChangeExecutionLog entries.

Permissions:

- Only TenantAdmin / TenantSecurityOfficer / TenantChangeManager roles (as per your RBAC) may manipulate these.

2) Global Change Management APIs

Base: `/api/global/change-sets`

Similar endpoints, but:

- ScopeType = "Global"
- ScopeId = null or special
- Category may include global policy or platform-level defaults.
- Approvals likely require GlobalAdmin-level roles.

Global endpoints manage:

- Cross-tenant enforcement changes
- Platform-wide security policies
- Default automation templates behavior (if you decide to route them through ChangeSets)

==================================================
FRONTEND – TENANT CHANGE CENTER (ADMIN PORTAL)
==================================================

Add a **Change Center** section to Tenant Admin Portal:

Route: `/tenant/change-center`

Tabs:

1) ChangeSets
2) Approvals
3) History

All labels via i18n (English/Persian).

1) ChangeSets tab:

- Table of ChangeSets:
  - Title
  - Category
  - Status
  - CreatedAt
  - RequestedBy
  - ApprovedAt (if any)
  - AppliedAt / ScheduledFor

- Actions:
  - Create new ChangeSet
  - Open details

- Detail view:
  - ChangeSet header:
    - Title, Category, Scope = current tenant
    - Status + timeline (Draft → InReview → Approved → …)
  - Items list:
    - For each ChangeItem:
      - TargetType/Target (policy name, workflow name, setting key)
      - Operation
      - Some diff view between CurrentValueJson and ProposedValueJson (high-level)
  - Simulation panel:
    - Button “Run simulation” → calls `/simulate`.
    - Show summary:
      - impactedUsersCount
      - impactedAppsCount
      - privilegedUsersAffectedCount
      - riskDirection (e.g. “RiskDecrease”)
  - Approvals panel:
    - List of approvals.
  - Execution log panel:
    - Last apply/rollback logs.

2) Approvals tab:

- For current admin as approver:
  - Show ChangeSets in InReview that require their decision.
  - For each:
    - Brief summary, SimulationSummary
    - Buttons: Approve / Reject → call respective APIs.

3) History tab:

- Filtered list of Applied / RolledBack / Cancelled ChangeSets.
- Quick view of:
  - Who changed what, when, and with what impact (from SimulationSummary + Execution logs).

==================================================
FRONTEND – GLOBAL CHANGE CENTER (GLOBAL ADMIN)
==================================================

Add a section to Global Admin Portal:

Route: `/global/change-center`

Tabs:

1) Global ChangeSets
2) Approvals
3) History

Same idea, but scope = Global:

- Global ChangeSets:
  - Typically for global policies, global defaults, global automation templates.
- Approvals:
  - Allow multi-approver flows for high-impact global changes.
- History:
  - For audits and compliance: full log of what changed across the platform.

==================================================
AUDIT, OBSERVABILITY, TESTS
==================================================

1) Audit events

Emit audit events for:

- "ChangeSet.Created"
- "ChangeSet.Updated"
- "ChangeSet.Submitted"
- "ChangeSet.SimulationExecuted"
- "ChangeSet.Approved"
- "ChangeSet.Rejected"
- "ChangeSet.Scheduled"
- "ChangeSet.Applied"
- "ChangeSet.RolledBack"
- "ChangeSet.Cancelled"

Each must record:
- ScopeType, ScopeId
- ChangeSetId
- ActorUserId
- Status change
- Basic SimulationSummary when relevant.

2) Observability

- Log:
  - simulation failures
  - apply/rollback failures
- Metrics:
  - number of ChangeSets per tenant
  - number of Applied vs RolledBack
  - failure rate of apply/rollback operations

3) Tests

Add tests for:

- ChangeSet lifecycle transitions (Draft → InReview → Approved → Scheduled → Applied → RolledBack/Cancelled).
- Approval rules (MinApprovers, requester cannot approve if separation-of-duties rule is on).
- SimulationEngine:
  - For a simple Policy change, verify correct impacted user count.
  - For enabling an AutomationWorkflow, verify that simulation flags correct workflows.

- Apply/rollback:
  - For a policy update, verify config changed (and can be restored).
  - For enabling/disabling an automation workflow, verify underlying module is updated.

==================================================
WHAT YOU MUST DO NOW
==================================================

1) Inspect current codebase to find:
   - Authorization/Policy storage and services
   - Automation module (Phase 26)
   - Tenant settings storage
   - Existing admin portals and routing

2) Create the `Onesign.Modules.ChangeManagement` module with:
   - Entities and EF mappings according to the spec
   - Repositories and application services for ChangeSets, Approvals, Execution logs
   - SimulationEngine abstraction and implementation
   - Apply & rollback logic with integration to Policy/Automation/TenantSettings

3) Implement backend APIs for:
   - Tenant ChangeSets
   - Global ChangeSets

4) Implement frontend UI:
   - `/tenant/change-center` (ChangeSets, Approvals, History)
   - `/global/change-center` (Global ChangeSets, Approvals, History)

5) Wire in audit events and observability.

6) Add tests and run them.

7) Verify at least two scenarios end-to-end:
   - Tightening a policy that increases MFA requirements, simulated and then applied.
   - Disabling an automation workflow that was causing too many aggressive actions, with simulation and apply.

Be ruthless:
If a ChangeSet could break a tenant and you’re not 100% sure what it does, that’s your bug. Design and implement this so that admins can see exactly what they’re doing before they blow up production.
