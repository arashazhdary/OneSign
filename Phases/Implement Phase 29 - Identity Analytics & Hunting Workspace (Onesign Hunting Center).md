You are a senior software architect and staff-level engineer working on the onesign platform:

- Multi-tenant SSO / IAM / IGA SaaS
- Backend: .NET 10, modular monolith, Clean Architecture, per-module boundaries
- Frontend: React / Next.js (Admin Portal: Global + Tenant, Login Portal, DevPortal, Account Center)
- Full multi-language support (English LTR as primary, Persian RTL as secondary) in UI

Previous phases (1–28) have implemented, among others:
- Core SSO, OIDC/OAuth2, OrgUnits, RBAC/ABAC authorization
- Federation, SCIM, AccessRequests, IdentityLifecycle
- PrivilegedAccess, AdaptiveSecurity, Governance
- Extensibility, DevPortal, NotificationCenter
- MultiRegion DR, Environment & On-Prem/Hybrid deployment
- Crypto, Privacy & DSR
- Phase 25: Insights & Reporting Center
- Phase 26: Automation & Playbooks Center (event-driven workflows)
- Phase 27: Change Management & Policy Simulation Center
- Phase 28: Identity Incident & Investigation Center (ITDR)

Your job now is to DESIGN AND IMPLEMENT **Phase 29: Identity Analytics & Hunting Workspace (Onesign Hunting Center)** as a production-grade feature.

This is NOT a generic SIEM. It is an identity-focused hunting and analytics workspace on top of onesign’s identity data.

You must NOT leave TODOs or “implement later” stubs. Everything must work end to end.

==================================================
HIGH LEVEL – WHAT PHASE 29 IS
==================================================

Goal: give Tenant Security teams and Global Security teams a **Hunting Workspace** to:

- Query identity-related events:
  - Sign-ins
  - Policy evaluations / access decisions
  - Access grants/revocations
  - Privileged access events
  - Automation executions (Phase 26)
  - ChangeSets (Phase 27)
  - Incidents (Phase 28)
- Build **Saved Queries** for recurring analysis.
- Define **Scheduled Hunts** that:
  - run periodically
  - produce findings
  - optionally:
    - open Incidents
    - trigger Automation workflows
    - send notifications.

Think of it as:
- A domain-specific “identity hunting” layer on top of:
  - Observability
  - Insights
  - Incidents
  - Automation
  - Change Management

==================================================
GLOBAL RULES (MUST FOLLOW)
==================================================

1) No TODOs, no half implementations
- No TODO comments.
- No NotImplementedException.
- No fake query engines that just return an empty list.
- All APIs and UI must be backed by real, working data access.

2) Respect modular monolith architecture
- Implement a dedicated module, for example:
  - `Onesign.Modules.Hunting`
- Separate domain, application, infrastructure, API layers as in other modules.

3) Strict multi-tenant behavior
- Tenant hunting is scoped to that tenant’s data.
- Global hunting is cross-tenant but strictly limited to GlobalSecurity roles.
- No tenant can query another tenant’s data.

4) Performance and safety
- Queries can be heavy. You must:
  - apply sensible limits (time range, max rows)
  - protect the system from abusive or accidental expensive queries.
- No arbitrary raw SQL from user input.

5) Multi-language UI
- All new UI text must go through the existing i18n mechanism.
- No hard-coded English strings in React components.

==================================================
CORE CONCEPTS YOU MUST IMPLEMENT
==================================================

Phase 29 introduces:

1) **Huntable Event Model**
   - A normalized set of identity-related event “tables” or logical streams:
     - SignInEvents
     - AccessChangeEvents (grants/revokes)
     - PrivilegedAccessEvents
     - PolicyDecisionEvents (allow/deny)
     - AutomationExecutionEvents
     - ChangeSetEvents
     - IncidentEvents

2) **Onesign Query Language (OQL) DSL (JSON-based)**
   - A safe, constrained, JSON-based query spec that supports:
     - selecting a dataset (e.g. “SignInEvents”)
     - filters (WHERE-like)
     - projections (which fields)
     - sorting
     - limits
     - optional aggregations (count, group-by by a small set of fields).

3) **SavedQuery**
   - A named, reusable query definition with metadata.

4) **ScheduledHunt**
   - A scheduled run of a SavedQuery with:
     - schedule (frequency)
     - thresholds for “finding” detection
     - actions to perform on matches (create incidents, send notifications, trigger automation).

5) **HuntResult / Finding**
   - Summary record of each scheduled run:
     - matching row count
     - sample results
     - actions taken (if any).

==================================================
BACKEND – DATA MODEL (YOU MUST IMPLEMENT)
==================================================

Create a module `Onesign.Modules.Hunting` with at least these entities:

1) SavedQuery

Represents a reusable tenant- or global-scoped query.

- Id (Guid)
- ScopeType (string)              // "Tenant" or "Global"
- ScopeId (Guid?)                 // TenantId for tenant scope; null for global
- Name (string)
- Description (string?)
- Dataset (string)                // e.g. "SignInEvents", "AccessChangeEvents", "PrivilegedAccessEvents", etc.
- QueryDslJson (string)           // JSON representation of OQL (filters, projection, sort, etc.)
- IsGlobalTemplate (bool)         // for global templates
- IsEnabled (bool)
- CreatedByUserId (Guid)
- CreatedAt (DateTimeOffset)
- UpdatedByUserId (Guid?)
- UpdatedAt (DateTimeOffset?)

Table example: `Hunting_SavedQueries`.

2) ScheduledHunt

A scheduled job that runs a SavedQuery on a schedule.

- Id (Guid)
- ScopeType (string)              // "Tenant" or "Global"
- ScopeId (Guid?)                 // TenantId or null
- SavedQueryId (Guid, FK)
- Name (string)
- Description (string?)
- ScheduleSpec (string)           // e.g. "Hourly", "Daily", CRON-like or a structured spec
- IsEnabled (bool)

- MinMatchCountForFinding (int)   // threshold to consider a run as “Finding”
- MaxRowsToScan (int)             // safety limit
- TimeWindowMinutes (int)         // relative time window, e.g. last 60 minutes

- ActionsJson (string)            // configuration for actions:
                                  // e.g. { "createIncident": true, "triggerWorkflowId": "...", "notifyEmails": ["..."] }

- CreatedByUserId (Guid)
- CreatedAt (DateTimeOffset)
- UpdatedByUserId (Guid?)
- UpdatedAt (DateTimeOffset?)

Table: `Hunting_ScheduledHunts`.

3) HuntRun

Represents a single execution of a ScheduledHunt.

- Id (Guid)
- ScheduledHuntId (Guid, FK)
- ScopeType (string)
- ScopeId (Guid?)
- StartedAt (DateTimeOffset)
- CompletedAt (DateTimeOffset?)
- Status (string)                 // "Running", "Succeeded", "Failed"
- MatchCount (int)
- FindingCreated (bool)
- IncidentId (Guid?)              // if an Incident was created (from Phase 28)
- TriggeredWorkflowId (Guid?)     // Automation workflow, if any
- ErrorMessage (string?)

Table: `Hunting_HuntRuns`.

4) HuntSampleRow

Optional: store a LIMITED subset of result sample for each HuntRun.

- Id (Guid)
- HuntRunId (Guid, FK)
- RowIndex (int)
- Dataset (string)
- DocumentJson (string)           // JSON representation of a row (sanitized, no secrets)

Table: `Hunting_HuntSampleRows`.

You must:

- Create EF Core mappings and migrations.
- Add indexes for ScopeType, ScopeId, SavedQueryId, ScheduledHuntId, StartedAt, Status.

==================================================
BACKEND – HUNTABLE EVENT MODEL
==================================================

You must define a unified projection layer over existing data sources.

1) Datasets (logical tables)

Implement abstractions to query at least these datasets:

- `SignInEvents`
  - Fields:
    - TenantId
    - UserId
    - UserDisplayName
    - AppId (if applicable)
    - AppName
    - Timestamp
    - Result ("Success"/"Failure")
    - FailureReason (if any)
    - RiskScore (from AdaptiveSecurity)
    - IpAddress
    - Country
    - DeviceId
    - MfaRequired (bool)
    - MfaSatisfied (bool)

- `AccessChangeEvents`
  - Fields:
    - TenantId
    - UserId
    - AppId
    - AppName
    - ChangeType ("Grant" / "Revoke")
    - PerformedByUserId
    - PerformedByDisplayName
    - Timestamp
    - Reason (if available)
    - IsPrivilegedAccess (bool)

- `PrivilegedAccessEvents`
  - Fields:
    - TenantId
    - UserId
    - AppId
    - EventType ("JITGranted", "JITExpired", "BreakGlassUsed", etc.)
    - Timestamp
    - Justification
    - ApprovedByUserId
    - ApprovedByDisplayName

- `PolicyDecisionEvents`
  - Fields:
    - TenantId
    - UserId
    - AppId
    - PolicyId
    - PolicyName
    - Decision ("Allow" / "Deny")
    - Reason (e.g. which rule matched)
    - Timestamp

- `AutomationExecutionEvents` (from Phase 26)
  - Fields:
    - TenantId
    - WorkflowId
    - WorkflowName
    - EventType
    - Status ("Succeeded", "Failed")
    - StartedAt
    - CompletedAt
    - ActionsExecutedCount
    - ActionsFailedCount

- `ChangeSetEvents` (from Phase 27)
  - Fields:
    - ScopeType
    - ScopeId
    - ChangeSetId
    - Category
    - Status
    - CreatedAt
    - AppliedAt
    - RolledBackAt

- `IncidentEvents` (from Phase 28)
  - Fields:
    - TenantId
    - IncidentId
    - Category
    - Severity
    - Status
    - CreatedAt
    - ResolvedAt
    - ClosedAt
    - PrimaryUserId (if any)
    - PrimaryAppId (if any)

2) Implementation approach

- You do NOT need to physically copy all data.
- Implement per-dataset query services that:
  - translate OQL filters into EF/LINQ queries over existing tables and/or materialized views.
- Ensure:
  - Tenant scoping
  - Reasonable performance
  - No raw SQL from user.

==================================================
BACKEND – OQL (ONESIGN QUERY LANGUAGE) DSL
==================================================

Define a JSON-based query spec that the frontend can generate and the backend can safely interpret.

Example structure:

```json
{
  "dataset": "SignInEvents",
  "timeRange": {
    "from": "2025-01-01T00:00:00Z",
    "to": "2025-01-02T00:00:00Z"
  },
  "filter": {
    "all": [
      { "==": [ { "field": "Result" }, "Failure" ] },
      { ">=": [ { "field": "RiskScore" }, 70 ] },
      { "in": [ { "field": "Country" }, ["US", "GB", "DE"] ] }
    ]
  },
  "select": [
    "Timestamp",
    "UserDisplayName",
    "AppName",
    "Result",
    "RiskScore",
    "IpAddress",
    "Country"
  ],
  "sort": [
    { "field": "Timestamp", "direction": "desc" }
  ],
  "limit": 200
}



Minimum features:

dataset – one of the supported data sources.

timeRange – strongly recommended; you MUST enforce a max allowed window if omitted.

filter:

JSON logic–like:

all (AND)

any (OR)

==, !=, >, >=, <, <=, in, notIn.

select – fields to include.

sort – field + direction.

limit – max rows (with hard upper bound in backend).

The actual shape and parsing can be adjusted, but it must be structured, safe and must NOT be arbitrary code.

==================================================
BACKEND – QUERY EXECUTION SERVICE

Implement a HuntingQueryService that:

Validates incoming OQL spec:

dataset is supported

fields exist and are allowed

limit is within allowed bounds

timeRange is within a configurable max window.

Routes the query to the appropriate dataset service:

IIdentitySignInEventsQueryService

IAccessChangeEventsQueryService

IPrivilegedAccessEventsQueryService

etc.

Translates the filter tree into EF/LINQ expressions.

Executes the query with:

server-side filtering

server-side sorting

limit.

Returns:

rows (as an array of JSON objects)

totalApprox (approximate total count if computing exact is expensive)

dataset and meta (for field descriptions if needed).

==================================================
BACKEND – SCHEDULED HUNTS ENGINE

Implement a background job runner:

Name: e.g. ScheduledHuntsRunner.

Behavior:

Periodically (e.g. every minute):

Load all enabled ScheduledHunts.

For each:

Determine if it is due to run (based on ScheduleSpec and last HuntRun).

If due:

Build an OQL query:

dataset = SavedQuery.Dataset

queryDsl = SavedQuery.QueryDslJson, but override timeRange using TimeWindowMinutes (e.g. last N minutes).

enforce MaxRowsToScan as limit.

Execute query via HuntingQueryService.

Create a HuntRun record:

Status = "Running" → later "Succeeded"/"Failed".

MatchCount = number of rows returned (respecting limit).

If MatchCount >= MinMatchCountForFinding:

Mark as a “Finding”.

Apply actions from ActionsJson:

create incident (Phase 28)

trigger automation workflow (Phase 26)

send notification via NotificationCenter

Link any created IncidentId or WorkflowId into HuntRun.

Log errors in HuntRun.ErrorMessage and mark status = "Failed" if execution fails.

Actions in ActionsJson (example):

{
  "createIncident": true,
  "incidentCategory": "HuntFinding",
  "incidentSeverity": "High",
  "incidentTitleTemplate": "Suspicious sign-in pattern detected",
  "triggerWorkflowId": "00000000-0000-0000-0000-000000000000",
  "notifyEmails": ["secops@example.com"]
}


You must implement at least:

createIncident action

notifyEmails action (via NotificationCenter)

triggerWorkflowId action (via Automation module).

==================================================
BACKEND – APIS YOU MUST IMPLEMENT

Tenant Hunting APIs

Base: /api/tenant/hunting

Implement:

POST /api/tenant/hunting/query

Body: OQL JSON (dataset + filters + select + etc.) OR reference to SavedQuery.

Behavior:

Validate and execute query in tenant scope.

Returns:

rows[]

meta (fields, dataset)

totalApprox.

GET /api/tenant/hunting/saved-queries

GET /api/tenant/hunting/saved-queries/{id}

POST /api/tenant/hunting/saved-queries

Create SavedQuery for tenant.

PUT /api/tenant/hunting/saved-queries/{id}

DELETE /api/tenant/hunting/saved-queries/{id}

GET /api/tenant/hunting/scheduled-hunts

GET /api/tenant/hunting/scheduled-hunts/{id}

POST /api/tenant/hunting/scheduled-hunts

Create ScheduledHunt:

reference SavedQueryId

set ScheduleSpec, MinMatchCountForFinding, TimeWindowMinutes, ActionsJson.

PUT /api/tenant/hunting/scheduled-hunts/{id}

DELETE /api/tenant/hunting/scheduled-hunts/{id}

GET /api/tenant/hunting/scheduled-hunts/{id}/runs

List HuntRun records for that ScheduledHunt.

GET /api/tenant/hunting/hunt-runs/{runId}

Details for a HuntRun, including sample rows.

Permissions:

Only TenantSecurityOfficer, TenantSecurityAnalyst and similar high-privilege roles.

Global Hunting APIs

Base: /api/global/hunting

Implement:

POST /api/global/hunting/query

Like tenant query but with:

optional tenant filter in OQL.

Only for GlobalSecurityAdmin / GlobalAdmin.

CRUD for global SavedQueries (ScopeType = "Global"):

GET /api/global/hunting/saved-queries

POST /api/global/hunting/saved-queries

etc.

Global ScheduledHunts:

same pattern as tenant, but ScopeType = "Global".

They can create incidents per tenant where findings occur.

==================================================
FRONTEND – TENANT HUNTING WORKSPACE

In the Tenant Admin Portal, add:

Route: /tenant/hunting

Tabs:

Live Query

Saved Queries

Scheduled Hunts

Hunt History

All UI text must use i18n.

Live Query tab:

UI components:

Dataset selector (Sign-In Events, Access Changes, Privileged Access, etc.).

Time range picker.

Filter builder:

field dropdown (depending on dataset)

operator dropdown (==, !=, >, >=, in, etc.)

value input.

ability to add multiple filters (AND/OR).

Select columns to display.

Sort options.

Run button.

Behavior:

Build OQL JSON and call /api/tenant/hunting/query.

Render results in a paginated table.

Show meta: dataset, approximate total.

Button: “Save as query” → opens modal for name/description, then creates SavedQuery.

Export:

Option to export current result set to CSV (or at least top N rows).

Saved Queries tab:

List of SavedQueries:

Name

Dataset

CreatedBy

CreatedAt

Actions:

Run (open in Live Query with pre-filled values).

Edit (update filters/description).

Delete.

“Create Scheduled Hunt from this query”.

Scheduled Hunts tab:

List ScheduledHunts:

Name

Linked SavedQuery name

ScheduleSpec

IsEnabled

MinMatchCountForFinding

LastRunStatus

LastRunAt

LastRunMatchCount

Actions:

Create new ScheduledHunt (wizard):

Step 1: choose SavedQuery.

Step 2: set schedule and window (TimeWindowMinutes).

Step 3: set MinMatchCountForFinding and Actions (create incident, notify, trigger playbook).

Edit / Delete.

View runs: navigate to Hunt History filtered by this scheduled hunt.

Hunt History tab:

List HuntRuns:

StartedAt

ScheduledHunt name

Status

MatchCount

FindingCreated

IncidentId (link to Incident Center)

Detail view:

Basic run metadata.

Sample rows (from HuntSampleRows).

Any actions taken (incident created, playbook triggered, notifications sent).

==================================================
FRONTEND – GLOBAL HUNTING WORKSPACE

In the Global Admin Portal, add:

Route: /global/hunting

Tabs (similar structure but cross-tenant):

Live Query (cross-tenant)

Saved Queries (global)

Scheduled Hunts (global)

Hunt Overview

Adjustments:

Live Query:

Add Tenant filter (multi-select).

Results show Tenant column.

Scheduled Hunts:

Global hunts may create incidents in multiple tenants if findings occur.

Hunt Overview:

Aggregated metrics:

number of findings per tenant

top queries/hunts by matches

distribution of findings by category/dataset.

==================================================
AUDIT, OBSERVABILITY, TESTS

Audit events

Emit audit events for:

"Hunting.SavedQueryCreated"

"Hunting.SavedQueryUpdated"

"Hunting.SavedQueryDeleted"

"Hunting.ScheduledHuntCreated"

"Hunting.ScheduledHuntUpdated"

"Hunting.ScheduledHuntDeleted"

"Hunting.QueryExecuted"

"Hunting.HuntRunStarted"

"Hunting.HuntRunCompleted"

"Hunting.HuntFindingCreated"

Each event must include:

ScopeType, ScopeId

SavedQueryId or ScheduledHuntId when relevant

ActorUserId for CRUD actions

Basic run metrics (MatchCount, Status) for HuntRun events.

Observability

Log:

query validation errors

long running queries (with timing)

scheduled hunt failures

Metrics:

number of queries run per tenant

average query duration

number of findings per dataset

scheduled hunt success/failure rate

Tests

Add tests for:

OQL parsing and validation:

invalid fields/operators rejected

time range enforced

Dataset query services:

filtering and projection for each dataset type.

ScheduledHuntsRunner:

due detection logic.

correct creation of HuntRun.

actions (create incident, trigger workflow, notify).

APIs:

SavedQueries CRUD

ScheduledHunts CRUD

Query execution.

==================================================
WHAT YOU MUST DO NOW

Inspect the existing codebase to locate:

observability / log/metrics sources

Insights module

Incidents, Automation, ChangeManagement modules

Admin Portal structure

Create the Onesign.Modules.Hunting module:

Entities, EF mappings, migrations

Dataset query services for SignInEvents, AccessChangeEvents, PrivilegedAccessEvents, PolicyDecisionEvents, AutomationExecutionEvents, ChangeSetEvents, IncidentEvents

OQL parsing and validation

HuntingQueryService

Implement the ScheduledHunts engine:

load ScheduledHunts

execute queries

create HuntRuns

apply actions (incidents, notifications, automation)

Implement backend APIs:

/api/tenant/hunting/*

/api/global/hunting/*

Implement frontend:

Tenant Hunting Workspace at /tenant/hunting

Global Hunting Workspace at /global/hunting

Wire in audit events and metrics.

Verify end to end at least the following scenarios:

A TenantSecurityAnalyst defines a SavedQuery to detect:

"Failed sign-ins with high risk score from specific countries in last 24 hours".

Runs it live, sees real results.

The same query is converted into a ScheduledHunt:

Runs hourly.

When matches exceed MinMatchCountForFinding:

Creates an Incident.

Sends an email to SecOps.

Be ruthless:
If a SavedQuery looks nice in UI but doesn’t actually run correctly, or if scheduled hunts silently do nothing, that is your bug. Implement this so that a real SecOps team could meaningfully hunt identity threats in production.
