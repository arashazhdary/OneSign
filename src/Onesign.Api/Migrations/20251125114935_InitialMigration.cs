using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onesign.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "IdentityLifecycle");

            migrationBuilder.EnsureSchema(
                name: "AccessRequests");

            migrationBuilder.EnsureSchema(
                name: "AdaptiveSecurity");

            migrationBuilder.EnsureSchema(
                name: "Automation");

            migrationBuilder.EnsureSchema(
                name: "PrivilegedAccess");

            migrationBuilder.EnsureSchema(
                name: "ChangeMgmt");

            migrationBuilder.EnsureSchema(
                name: "Privacy");

            migrationBuilder.EnsureSchema(
                name: "Deployment");

            migrationBuilder.EnsureSchema(
                name: "Hunting");

            migrationBuilder.EnsureSchema(
                name: "Incidents");

            migrationBuilder.EnsureSchema(
                name: "IdentityInsights");

            migrationBuilder.EnsureSchema(
                name: "Insights");

            migrationBuilder.EnsureSchema(
                name: "Crypto");

            migrationBuilder.EnsureSchema(
                name: "Extensibility");

            migrationBuilder.EnsureSchema(
                name: "NotificationCenter");

            migrationBuilder.EnsureSchema(
                name: "Platform");

            migrationBuilder.EnsureSchema(
                name: "MultiRegion");

            migrationBuilder.CreateTable(
                name: "AccessPackages",
                schema: "IdentityLifecycle",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    RoleIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApplicationIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessPackages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AccessRequests",
                schema: "AccessRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequesterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequesterName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Justification = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewComment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AdaptivePolicies",
                schema: "AdaptiveSecurity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Conditions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActionsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RiskThreshold = table.Column<int>(type: "int", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdaptivePolicies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ApiUsageLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApiKeyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ServiceAccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Endpoint = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    HttpMethod = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    StatusCode = table.Column<int>(type: "int", nullable: false),
                    ResponseTimeMs = table.Column<long>(type: "bigint", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiUsageLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationClients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ApplicationType = table.Column<int>(type: "int", nullable: false),
                    GrantType = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationClients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ActorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Metadata = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuthorizationCodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TenantUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RedirectUri = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CodeChallenge = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthorizationCodes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Automation_Workflows",
                schema: "Automation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ScopeType = table.Column<int>(type: "int", nullable: false),
                    IsTemplate = table.Column<bool>(type: "bit", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    Severity = table.Column<int>(type: "int", nullable: false),
                    IsEnforced = table.Column<bool>(type: "bit", nullable: false),
                    TenantCanDisable = table.Column<bool>(type: "bit", nullable: false),
                    TenantCanOverrideConditions = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Automation_Workflows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BreakGlassAccounts",
                schema: "PrivilegedAccess",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AllowedTenantsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllowedRolesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BreakGlassAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChangeMgmt_ApprovalRules",
                schema: "ChangeMgmt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScopeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ScopeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    MinApprovers = table.Column<int>(type: "int", nullable: false),
                    RequireSeparationOfDuties = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeMgmt_ApprovalRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChangeMgmt_ChangeSets",
                schema: "ChangeMgmt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScopeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ScopeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RequestedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ApprovedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ApprovedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ScheduledFor = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    AppliedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RolledBackAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RollbackReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SimulationSummaryJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeMgmt_ChangeSets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClientRedirectUris",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Uri = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientRedirectUris", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClientSecrets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SecretHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientSecrets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DataRetentionPolicies",
                schema: "Privacy",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataCategory = table.Column<int>(type: "int", nullable: false),
                    RetentionPeriodDays = table.Column<int>(type: "int", nullable: false),
                    HardDeleteAfter = table.Column<bool>(type: "bit", nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataRetentionPolicies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DataSubjectRequests",
                schema: "Privacy",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RequestedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResultLocation = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataSubjectRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EnvironmentFeatureConfigs",
                schema: "Deployment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EnvironmentId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MaxTenants = table.Column<int>(type: "int", nullable: false),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    MaxApplications = table.Column<int>(type: "int", nullable: false),
                    EnabledModulesJson = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnvironmentFeatureConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExternalLogins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GlobalUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProviderUserId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalLogins", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Global_Environments",
                schema: "Deployment",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    RegionId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BaseUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AppVersion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DbSchemaVersion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LicenseKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastHeartbeatAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Global_Environments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GlobalUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EmailVerified = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HRIdentityRecords",
                schema: "IdentityLifecycle",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExternalEmployeeId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OrgUnitCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    JobRole = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ManagerEmployeeId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastSyncedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HRIdentityRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Hunting_SavedQueries",
                schema: "Hunting",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScopeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ScopeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Dataset = table.Column<int>(type: "int", nullable: false),
                    QueryDslJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsGlobalTemplate = table.Column<bool>(type: "bit", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hunting_SavedQueries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Incidents_Entities",
                schema: "Incidents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityType = table.Column<int>(type: "int", nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents_Entities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Incidents_Events",
                schema: "Incidents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EventData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SourceModule = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents_Events", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Incidents_Incidents",
                schema: "Incidents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Severity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DetectionSource = table.Column<int>(type: "int", nullable: false),
                    PrimaryUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PrimaryAppId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AffectedUsersCount = table.Column<int>(type: "int", nullable: false),
                    AffectedAppsCount = table.Column<int>(type: "int", nullable: false),
                    DetectedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcknowledgedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcknowledgedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolvedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ResolutionSummary = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AssignedTo = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsEscalated = table.Column<bool>(type: "bit", nullable: false),
                    EscalationReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RootCause = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClosingNotes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents_Incidents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Incidents_Notes",
                schema: "Incidents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents_Notes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Incidents_PlaybookRuns",
                schema: "Incidents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Result = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents_PlaybookRuns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Insights",
                schema: "IdentityInsights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Severity = table.Column<int>(type: "int", nullable: false),
                    ScopeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ScopeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MessageKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DataJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolvedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insights", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Insights_ApplicationDailyUsageSnapshots",
                schema: "Insights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    UniqueUsers = table.Column<int>(type: "int", nullable: false),
                    SignInCount = table.Column<int>(type: "int", nullable: false),
                    FailedSignInCount = table.Column<int>(type: "int", nullable: false),
                    HighRiskSignInCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insights_ApplicationDailyUsageSnapshots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Insights_ReportSubscriptions",
                schema: "Insights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScopeType = table.Column<int>(type: "int", nullable: false),
                    ScopeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReportType = table.Column<int>(type: "int", nullable: false),
                    CronOrFrequency = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EmailRecipients = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastSentAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insights_ReportSubscriptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Insights_TenantDailyUsageSnapshots",
                schema: "Insights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    TotalUsers = table.Column<int>(type: "int", nullable: false),
                    ActiveUsers = table.Column<int>(type: "int", nullable: false),
                    MfaEnabledUsers = table.Column<int>(type: "int", nullable: false),
                    TotalApplications = table.Column<int>(type: "int", nullable: false),
                    ApplicationsWithSSOEnabled = table.Column<int>(type: "int", nullable: false),
                    TotalSignInCount = table.Column<int>(type: "int", nullable: false),
                    FailedSignInCount = table.Column<int>(type: "int", nullable: false),
                    HighRiskSignInCount = table.Column<int>(type: "int", nullable: false),
                    AccessRequestCount = table.Column<int>(type: "int", nullable: false),
                    AccessRequestApprovedCount = table.Column<int>(type: "int", nullable: false),
                    LifecycleEventsCount = table.Column<int>(type: "int", nullable: false),
                    EmergencyAccessCount = table.Column<int>(type: "int", nullable: false),
                    ActiveIncidents = table.Column<int>(type: "int", nullable: false),
                    PendingChangeSets = table.Column<int>(type: "int", nullable: false),
                    RiskyApplications = table.Column<int>(type: "int", nullable: false),
                    SecurityScore = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insights_TenantDailyUsageSnapshots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Insights_UserSecurityPostures",
                schema: "Insights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastSignInAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MfaEnabled = table.Column<bool>(type: "bit", nullable: false),
                    EnabledAppsCount = table.Column<int>(type: "int", nullable: false),
                    UsedAppsLast30DaysCount = table.Column<int>(type: "int", nullable: false),
                    HighRiskEventsLast30Days = table.Column<int>(type: "int", nullable: false),
                    IsAnonymized = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insights_UserSecurityPostures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JitGrants",
                schema: "PrivilegedAccess",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccessRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Justification = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JitGrants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KeyRotationPolicies",
                schema: "Crypto",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScopeType = table.Column<int>(type: "int", nullable: false),
                    ScopeId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Purpose = table.Column<int>(type: "int", nullable: false),
                    RotationPeriodDays = table.Column<int>(type: "int", nullable: false),
                    OverlapPeriodDays = table.Column<int>(type: "int", nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeyRotationPolicies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KeySets",
                schema: "Crypto",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScopeType = table.Column<int>(type: "int", nullable: false),
                    ScopeId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Purpose = table.Column<int>(type: "int", nullable: false),
                    IsDefaultForScope = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeySets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KeyVersions",
                schema: "Crypto",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    KeySetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Kid = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Algorithm = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    KeyMaterial = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    State = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeyVersions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LifecyclePolicies",
                schema: "IdentityLifecycle",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    OrgUnitCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    JobRole = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EmploymentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AccessPackageIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LifecyclePolicies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LoginHooks",
                schema: "Extensibility",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Stage = table.Column<int>(type: "int", nullable: false),
                    EndpointUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Secret = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TimeoutSeconds = table.Column<int>(type: "int", nullable: false),
                    FailOpen = table.Column<bool>(type: "bit", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginHooks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MfaChallenges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MethodType = table.Column<int>(type: "int", nullable: false),
                    CodeHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Consumed = table.Column<bool>(type: "bit", nullable: false),
                    DeviceId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MfaChallenges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationChannelConfigs",
                schema: "NotificationCenter",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    ConfigurationJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationChannelConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationOutboxItems",
                schema: "NotificationCenter",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    RecipientAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RecipientUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContextDataJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    NextRetryAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveredAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationOutboxItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationTemplates",
                schema: "NotificationCenter",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    SubjectTemplate = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    BodyTemplate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrgUnitMfaRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrgUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MfaRequired = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrgUnitMfaRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PasswordResetTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasswordResetTokens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Platform_IntegrationTestResults",
                schema: "Platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestSuiteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TestName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CompletedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: true),
                    StackTrace = table.Column<string>(type: "nvarchar(max)", maxLength: 10000, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Platform_IntegrationTestResults", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Platform_MigrationHistory",
                schema: "Platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MigrationName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AppliedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AppliedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", maxLength: 5000, nullable: true),
                    DurationTicks = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Platform_MigrationHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Platform_Versions",
                schema: "Platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReleaseDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReleaseNotes = table.Column<string>(type: "nvarchar(max)", maxLength: 10000, nullable: true),
                    IsCurrentVersion = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Platform_Versions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PolicyDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Effect = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PolicyDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PolicyTargets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetType = table.Column<int>(type: "int", nullable: false),
                    TargetKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TargetName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PolicyTargets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PrivilegedSessions",
                schema: "PrivilegedAccess",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserDisplayName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PrivilegedRolesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrivilegedSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RegionBackupSets",
                schema: "MultiRegion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RegionId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BackupType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StorageLocation = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegionBackupSets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Regions",
                schema: "MultiRegion",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    EndpointBaseUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DbClusterRef = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StorageClusterRef = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastHealthCheckAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Regions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RiskEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    RiskLevel = table.Column<int>(type: "int", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DeviceId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DetailsJson = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RiskEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SdkConfigurations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SdkType = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ConfigurationJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SdkConfigurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SecurityPolicies",
                columns: table => new
                {
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MfaRequirementLevel = table.Column<int>(type: "int", nullable: false),
                    AllowMfaRememberDevice = table.Column<bool>(type: "bit", nullable: false),
                    RememberDeviceDays = table.Column<int>(type: "int", nullable: false),
                    RequireMfaForSensitiveApps = table.Column<bool>(type: "bit", nullable: false),
                    MaxFailedLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    EnableGeoAnomalyDetection = table.Column<bool>(type: "bit", nullable: false),
                    BlockLevel = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityPolicies", x => x.TenantId);
                });

            migrationBuilder.CreateTable(
                name: "SecuritySignals",
                schema: "AdaptiveSecurity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SignalType = table.Column<int>(type: "int", nullable: false),
                    RiskScore = table.Column<int>(type: "int", nullable: false),
                    DetailsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DetectedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActionTaken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecuritySignals", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RolesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastAccessAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantBackupSets",
                schema: "MultiRegion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RegionId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BackupType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StorageLocation = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantBackupSets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantDataResidencies",
                schema: "MultiRegion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataRegionId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BackupRegionId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CrossRegionReplicationAllowed = table.Column<bool>(type: "bit", nullable: false),
                    ComplianceTag = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantDataResidencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantRiskProfiles",
                schema: "IdentityInsights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RiskScore = table.Column<int>(type: "int", nullable: false),
                    UsersCount = table.Column<int>(type: "int", nullable: false),
                    HighRiskUsersCount = table.Column<int>(type: "int", nullable: false),
                    MfaEnrollmentRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    PrivilegedUsersCount = table.Column<int>(type: "int", nullable: false),
                    FailedLoginRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    OpenGovernanceFindingsCount = table.Column<int>(type: "int", nullable: false),
                    CalculatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantRiskProfiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GlobalUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsAdmin = table.Column<bool>(type: "bit", nullable: false),
                    FirstLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RequireMfaNextSignIn = table.Column<bool>(type: "bit", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false),
                    LockedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LockReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TokenTransformationRules",
                schema: "Extensibility",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TargetAppId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    RuleDefinitionJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TokenTransformationRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrustedDevices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DeviceName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FirstSeenAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrustedDevices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserLoginSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionToken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLoginSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserMfaMethods",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MethodType = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    SecretEncrypted = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMfaMethods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserRiskProfiles",
                schema: "IdentityInsights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserDisplayName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RiskScore = table.Column<int>(type: "int", nullable: false),
                    RiskFactorsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailedLoginCount = table.Column<int>(type: "int", nullable: false),
                    MfaEnabled = table.Column<bool>(type: "bit", nullable: false),
                    PrivilegedRolesCount = table.Column<int>(type: "int", nullable: false),
                    ApplicationsCount = table.Column<int>(type: "int", nullable: false),
                    CalculatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRiskProfiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserSecurityContexts",
                schema: "AdaptiveSecurity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CurrentRiskScore = table.Column<int>(type: "int", nullable: false),
                    RiskFactorsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastLoginLocation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LastLoginDevice = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TrustedDevicesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TrustedLocationsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSecurityContexts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WebhookDeliveryLogs",
                schema: "Extensibility",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PayloadJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    LastAttemptAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResponseStatusCode = table.Column<int>(type: "int", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebhookDeliveryLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WebhookEndpoints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    SecretKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EventTypesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastTriggeredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailureCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebhookEndpoints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WebhookSubscriptions",
                schema: "Extensibility",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EndpointUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Secret = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EventTypesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    MaxRetries = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastDeliveryAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastDeliveryStatus = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebhookSubscriptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowDefinitions",
                schema: "AccessRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TargetType = table.Column<int>(type: "int", nullable: false),
                    TargetId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ApprovalChainJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AccessRequestItems",
                schema: "AccessRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccessRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccessType = table.Column<int>(type: "int", nullable: false),
                    TargetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessRequestItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccessRequestItems_AccessRequests_AccessRequestId",
                        column: x => x.AccessRequestId,
                        principalSchema: "AccessRequests",
                        principalTable: "AccessRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApprovalSteps",
                schema: "AccessRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccessRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StepNumber = table.Column<int>(type: "int", nullable: false),
                    ApproverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApproverName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Action = table.Column<int>(type: "int", nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ActionAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalSteps_AccessRequests_AccessRequestId",
                        column: x => x.AccessRequestId,
                        principalSchema: "AccessRequests",
                        principalTable: "AccessRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Automation_Actions",
                schema: "Automation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActionType = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    ConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsCritical = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Automation_Actions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Automation_Actions_Automation_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalSchema: "Automation",
                        principalTable: "Automation_Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Automation_Conditions",
                schema: "Automation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExpressionType = table.Column<int>(type: "int", nullable: false),
                    Expression = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Automation_Conditions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Automation_Conditions_Automation_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalSchema: "Automation",
                        principalTable: "Automation_Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Automation_Executions",
                schema: "Automation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EventId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StartedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CompletedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ActionsExecutedCount = table.Column<int>(type: "int", nullable: false),
                    ActionsFailedCount = table.Column<int>(type: "int", nullable: false),
                    PayloadSnapshot = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Automation_Executions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Automation_Executions_Automation_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalSchema: "Automation",
                        principalTable: "Automation_Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Automation_Triggers",
                schema: "Automation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SourceModule = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Automation_Triggers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Automation_Triggers_Automation_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalSchema: "Automation",
                        principalTable: "Automation_Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChangeMgmt_Approvals",
                schema: "ChangeMgmt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChangeSetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApproverUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Decision = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DecidedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeMgmt_Approvals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeMgmt_Approvals_ChangeMgmt_ChangeSets_ChangeSetId",
                        column: x => x.ChangeSetId,
                        principalSchema: "ChangeMgmt",
                        principalTable: "ChangeMgmt_ChangeSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChangeMgmt_ChangeItems",
                schema: "ChangeMgmt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChangeSetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetType = table.Column<int>(type: "int", nullable: false),
                    TargetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Operation = table.Column<int>(type: "int", nullable: false),
                    CurrentValueJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProposedValueJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeMgmt_ChangeItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeMgmt_ChangeItems_ChangeMgmt_ChangeSets_ChangeSetId",
                        column: x => x.ChangeSetId,
                        principalSchema: "ChangeMgmt",
                        principalTable: "ChangeMgmt_ChangeSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChangeMgmt_ExecutionLogs",
                schema: "ChangeMgmt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChangeSetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Step = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeMgmt_ExecutionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeMgmt_ExecutionLogs_ChangeMgmt_ChangeSets_ChangeSetId",
                        column: x => x.ChangeSetId,
                        principalSchema: "ChangeMgmt",
                        principalTable: "ChangeMgmt_ChangeSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LifecycleEvents",
                schema: "IdentityLifecycle",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HRRecordId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    OldSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LifecycleEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LifecycleEvents_HRIdentityRecords_HRRecordId",
                        column: x => x.HRRecordId,
                        principalSchema: "IdentityLifecycle",
                        principalTable: "HRIdentityRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Hunting_ScheduledHunts",
                schema: "Hunting",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScopeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ScopeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SavedQueryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ScheduleSpec = table.Column<int>(type: "int", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    MinMatchCountForFinding = table.Column<int>(type: "int", nullable: false),
                    MaxRowsToScan = table.Column<int>(type: "int", nullable: false),
                    TimeWindowMinutes = table.Column<int>(type: "int", nullable: false),
                    ActionsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hunting_ScheduledHunts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Hunting_ScheduledHunts_Hunting_SavedQueries_SavedQueryId",
                        column: x => x.SavedQueryId,
                        principalSchema: "Hunting",
                        principalTable: "Hunting_SavedQueries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotificationDeliveryLogs",
                schema: "NotificationCenter",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OutboxItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ProviderMessageId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ErrorDetails = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationDeliveryLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationDeliveryLogs_NotificationOutboxItems_OutboxItemId",
                        column: x => x.OutboxItemId,
                        principalSchema: "NotificationCenter",
                        principalTable: "NotificationOutboxItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotificationEventSubscriptions",
                schema: "NotificationCenter",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecipientSelector = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationEventSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationEventSubscriptions_NotificationTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalSchema: "NotificationCenter",
                        principalTable: "NotificationTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlanFeatures",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    LimitType = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanFeatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanFeatures_Plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PolicyConditionGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PolicyDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LogicalOperator = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PolicyConditionGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PolicyConditionGroups_PolicyDefinitions_PolicyDefinitionId",
                        column: x => x.PolicyDefinitionId,
                        principalTable: "PolicyDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PolicyAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PolicyDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PolicyTargetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PolicyAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PolicyAssignments_PolicyDefinitions_PolicyDefinitionId",
                        column: x => x.PolicyDefinitionId,
                        principalTable: "PolicyDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PolicyAssignments_PolicyTargets_PolicyTargetId",
                        column: x => x.PolicyTargetId,
                        principalTable: "PolicyTargets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApiKeys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceAccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    KeyHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    KeyPrefix = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ScopesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokedReason = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiKeys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiKeys_ServiceAccounts_ServiceAccountId",
                        column: x => x.ServiceAccountId,
                        principalTable: "ServiceAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ObservabilityAuditEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CorrelationId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Severity = table.Column<int>(type: "int", nullable: false),
                    ActorId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActorDisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ActorType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Action = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TargetType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TargetId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObservabilityAuditEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ObservabilityAuditEvents_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OidcFederationProviders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProviderType = table.Column<int>(type: "int", nullable: false),
                    Authority = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ClientId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ClientSecret = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Scopes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OidcFederationProviders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OidcFederationProviders_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrgUnits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrgUnits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrgUnits_OrgUnits_ParentId",
                        column: x => x.ParentId,
                        principalTable: "OrgUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrgUnits_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SamlProviders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IdpSsoUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IdpCertificate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SpEntityId = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SpAssertionConsumerServiceUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    BindingType = table.Column<int>(type: "int", nullable: false),
                    SignAuthRequest = table.Column<bool>(type: "bit", nullable: false),
                    WantAssertionsSigned = table.Column<bool>(type: "bit", nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SamlProviders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SamlProviders_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ScimTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TokenHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScimTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScimTokens_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrialEndsAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CurrentPeriodEndsAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantSubscriptions_Plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantSubscriptions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantUsageSnapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CapturedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserCount = table.Column<int>(type: "int", nullable: false),
                    ActiveUsersLast30Days = table.Column<int>(type: "int", nullable: false),
                    ApplicationCount = table.Column<int>(type: "int", nullable: false),
                    IdpConnectionCount = table.Column<int>(type: "int", nullable: false),
                    OrgUnitCount = table.Column<int>(type: "int", nullable: false),
                    LoginsThisMonth = table.Column<long>(type: "bigint", nullable: false),
                    ScimCallsThisMonth = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantUsageSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantUsageSnapshots_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UsageCounters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MetricType = table.Column<int>(type: "int", nullable: false),
                    PeriodYear = table.Column<int>(type: "int", nullable: false),
                    PeriodMonth = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsageCounters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsageCounters_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Hunting_HuntRuns",
                schema: "Hunting",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScheduledHuntId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScopeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ScopeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CompletedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    MatchCount = table.Column<int>(type: "int", nullable: false),
                    FindingCreated = table.Column<bool>(type: "bit", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TriggeredWorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hunting_HuntRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Hunting_HuntRuns_Hunting_ScheduledHunts_ScheduledHuntId",
                        column: x => x.ScheduledHuntId,
                        principalSchema: "Hunting",
                        principalTable: "Hunting_ScheduledHunts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PolicyConditions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConditionGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceType = table.Column<int>(type: "int", nullable: false),
                    SourceKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Operator = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PolicyConditions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PolicyConditions_PolicyConditionGroups_ConditionGroupId",
                        column: x => x.ConditionGroupId,
                        principalTable: "PolicyConditionGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationOrgUnits",
                columns: table => new
                {
                    ApplicationClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrgUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationOrgUnits", x => new { x.ApplicationClientId, x.OrgUnitId });
                    table.ForeignKey(
                        name: "FK_ApplicationOrgUnits_ApplicationClients_ApplicationClientId",
                        column: x => x.ApplicationClientId,
                        principalTable: "ApplicationClients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationOrgUnits_OrgUnits_OrgUnitId",
                        column: x => x.OrgUnitId,
                        principalTable: "OrgUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DelegatedAdminScopes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrgUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScopeType = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DelegatedAdminScopes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DelegatedAdminScopes_OrgUnits_OrgUnitId",
                        column: x => x.OrgUnitId,
                        principalTable: "OrgUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DelegatedAdminScopes_TenantUsers_TenantUserId",
                        column: x => x.TenantUserId,
                        principalTable: "TenantUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserOrgUnits",
                columns: table => new
                {
                    TenantUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrgUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOrgUnits", x => new { x.TenantUserId, x.OrgUnitId });
                    table.ForeignKey(
                        name: "FK_UserOrgUnits_OrgUnits_OrgUnitId",
                        column: x => x.OrgUnitId,
                        principalTable: "OrgUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserOrgUnits_TenantUsers_TenantUserId",
                        column: x => x.TenantUserId,
                        principalTable: "TenantUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AttributeMappings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SamlProviderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OidcFederationProviderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    InternalAttributeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MappingType = table.Column<int>(type: "int", nullable: false),
                    ExternalAttributeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StaticValue = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TemplateExpression = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttributeMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttributeMappings_OidcFederationProviders_OidcFederationProviderId",
                        column: x => x.OidcFederationProviderId,
                        principalTable: "OidcFederationProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttributeMappings_SamlProviders_SamlProviderId",
                        column: x => x.SamlProviderId,
                        principalTable: "SamlProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttributeMappings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JitProvisioningLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SamlProviderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OidcFederationProviderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ExternalUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ProvisionedDataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JitProvisioningLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JitProvisioningLogs_OidcFederationProviders_OidcFederationProviderId",
                        column: x => x.OidcFederationProviderId,
                        principalTable: "OidcFederationProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JitProvisioningLogs_SamlProviders_SamlProviderId",
                        column: x => x.SamlProviderId,
                        principalTable: "SamlProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JitProvisioningLogs_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Hunting_HuntSampleRows",
                schema: "Hunting",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HuntRunId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RowIndex = table.Column<int>(type: "int", nullable: false),
                    Dataset = table.Column<int>(type: "int", nullable: false),
                    DocumentJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hunting_HuntSampleRows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Hunting_HuntSampleRows_Hunting_HuntRuns_HuntRunId",
                        column: x => x.HuntRunId,
                        principalSchema: "Hunting",
                        principalTable: "Hunting_HuntRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccessPackages_TenantId_IsEnabled",
                schema: "IdentityLifecycle",
                table: "AccessPackages",
                columns: new[] { "TenantId", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_AccessRequestItems_AccessRequestId",
                schema: "AccessRequests",
                table: "AccessRequestItems",
                column: "AccessRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_AccessRequests_TenantId_RequesterId",
                schema: "AccessRequests",
                table: "AccessRequests",
                columns: new[] { "TenantId", "RequesterId" });

            migrationBuilder.CreateIndex(
                name: "IX_AccessRequests_TenantId_Status_CreatedAt",
                schema: "AccessRequests",
                table: "AccessRequests",
                columns: new[] { "TenantId", "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AdaptivePolicies_TenantId",
                schema: "AdaptiveSecurity",
                table: "AdaptivePolicies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AdaptivePolicies_TenantId_IsEnabled",
                schema: "AdaptiveSecurity",
                table: "AdaptivePolicies",
                columns: new[] { "TenantId", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_AdaptivePolicies_TenantId_Priority",
                schema: "AdaptiveSecurity",
                table: "AdaptivePolicies",
                columns: new[] { "TenantId", "Priority" });

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_KeyHash",
                table: "ApiKeys",
                column: "KeyHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_ServiceAccountId",
                table: "ApiKeys",
                column: "ServiceAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_TenantId_Status",
                table: "ApiKeys",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ApiUsageLogs_ApiKeyId_RequestedAt",
                table: "ApiUsageLogs",
                columns: new[] { "ApiKeyId", "RequestedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ApiUsageLogs_TenantId_RequestedAt",
                table: "ApiUsageLogs",
                columns: new[] { "TenantId", "RequestedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationClients_ClientId",
                table: "ApplicationClients",
                column: "ClientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationOrgUnits_ApplicationClientId",
                table: "ApplicationOrgUnits",
                column: "ApplicationClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationOrgUnits_OrgUnitId",
                table: "ApplicationOrgUnits",
                column: "OrgUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalSteps_AccessRequestId_StepNumber",
                schema: "AccessRequests",
                table: "ApprovalSteps",
                columns: new[] { "AccessRequestId", "StepNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalSteps_ApproverId_Action",
                schema: "AccessRequests",
                table: "ApprovalSteps",
                columns: new[] { "ApproverId", "Action" });

            migrationBuilder.CreateIndex(
                name: "IX_AttributeMappings_OidcFederationProviderId",
                table: "AttributeMappings",
                column: "OidcFederationProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_AttributeMappings_SamlProviderId",
                table: "AttributeMappings",
                column: "SamlProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_AttributeMappings_TenantId",
                table: "AttributeMappings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditEvents_ActorId",
                table: "AuditEvents",
                column: "ActorId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditEvents_TenantId_CreatedAt",
                table: "AuditEvents",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AuthorizationCodes_Code",
                table: "AuthorizationCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuthorizationCodes_ExpiresAt",
                table: "AuthorizationCodes",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_AuthorizationCodes_TenantUserId_ApplicationClientId",
                table: "AuthorizationCodes",
                columns: new[] { "TenantUserId", "ApplicationClientId" });

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Actions_WorkflowId",
                schema: "Automation",
                table: "Automation_Actions",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Conditions_WorkflowId",
                schema: "Automation",
                table: "Automation_Conditions",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Executions_TenantId",
                schema: "Automation",
                table: "Automation_Executions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Executions_TenantId_StartedAt",
                schema: "Automation",
                table: "Automation_Executions",
                columns: new[] { "TenantId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Executions_TenantId_Status",
                schema: "Automation",
                table: "Automation_Executions",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Executions_WorkflowId",
                schema: "Automation",
                table: "Automation_Executions",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Executions_WorkflowId_EventId",
                schema: "Automation",
                table: "Automation_Executions",
                columns: new[] { "WorkflowId", "EventId" });

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Triggers_EventType",
                schema: "Automation",
                table: "Automation_Triggers",
                column: "EventType");

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Triggers_WorkflowId",
                schema: "Automation",
                table: "Automation_Triggers",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Workflows_ScopeType_IsTemplate_IsEnforced",
                schema: "Automation",
                table: "Automation_Workflows",
                columns: new[] { "ScopeType", "IsTemplate", "IsEnforced" });

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Workflows_TenantId",
                schema: "Automation",
                table: "Automation_Workflows",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Workflows_TenantId_IsEnabled",
                schema: "Automation",
                table: "Automation_Workflows",
                columns: new[] { "TenantId", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_BreakGlassAccounts_IsEnabled",
                schema: "PrivilegedAccess",
                table: "BreakGlassAccounts",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_BreakGlassAccounts_Username",
                schema: "PrivilegedAccess",
                table: "BreakGlassAccounts",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ApprovalRules_ScopeCategory",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ApprovalRules",
                columns: new[] { "ScopeType", "ScopeId", "Category" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_Approvals_ApproverUserId",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_Approvals",
                column: "ApproverUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_Approvals_ChangeSetId",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_Approvals",
                column: "ChangeSetId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_Approvals_ChangeSetUser",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_Approvals",
                columns: new[] { "ChangeSetId", "ApproverUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeItems_ChangeSetId",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeItems",
                column: "ChangeSetId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeItems_Target",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeItems",
                columns: new[] { "TargetType", "TargetId" });

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeSets_CreatedAt",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeSets",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeSets_RequestedBy",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeSets",
                column: "RequestedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeSets_Scope",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeSets",
                columns: new[] { "ScopeType", "ScopeId" });

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeSets_Status",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeSets",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ExecutionLogs_ChangeSetId",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ExecutionLogs",
                column: "ChangeSetId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ExecutionLogs_ChangeSetStep",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ExecutionLogs",
                columns: new[] { "ChangeSetId", "Step" });

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ExecutionLogs_CreatedAt",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ExecutionLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DataRetentionPolicies_TenantId",
                schema: "Privacy",
                table: "DataRetentionPolicies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DataRetentionPolicies_TenantId_DataCategory",
                schema: "Privacy",
                table: "DataRetentionPolicies",
                columns: new[] { "TenantId", "DataCategory" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DataSubjectRequests_TenantId_RequestedAt",
                schema: "Privacy",
                table: "DataSubjectRequests",
                columns: new[] { "TenantId", "RequestedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSubjectRequests_TenantId_Status",
                schema: "Privacy",
                table: "DataSubjectRequests",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSubjectRequests_TenantId_SubjectId",
                schema: "Privacy",
                table: "DataSubjectRequests",
                columns: new[] { "TenantId", "SubjectId" });

            migrationBuilder.CreateIndex(
                name: "IX_DelegatedAdminScopes_OrgUnitId",
                table: "DelegatedAdminScopes",
                column: "OrgUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_DelegatedAdminScopes_TenantUserId",
                table: "DelegatedAdminScopes",
                column: "TenantUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DelegatedAdminScopes_TenantUserId_OrgUnitId",
                table: "DelegatedAdminScopes",
                columns: new[] { "TenantUserId", "OrgUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnvironmentFeatureConfigs_EnvironmentId",
                schema: "Deployment",
                table: "EnvironmentFeatureConfigs",
                column: "EnvironmentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalLogins_Provider_ProviderUserId",
                table: "ExternalLogins",
                columns: new[] { "Provider", "ProviderUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Global_Environments_RegionId",
                schema: "Deployment",
                table: "Global_Environments",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_Global_Environments_Type",
                schema: "Deployment",
                table: "Global_Environments",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_GlobalUsers_Email",
                table: "GlobalUsers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HRIdentityRecords_TenantId_ExternalEmployeeId",
                schema: "IdentityLifecycle",
                table: "HRIdentityRecords",
                columns: new[] { "TenantId", "ExternalEmployeeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HRIdentityRecords_TenantId_Status",
                schema: "IdentityLifecycle",
                table: "HRIdentityRecords",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_HuntRuns_FindingCreated",
                schema: "Hunting",
                table: "Hunting_HuntRuns",
                column: "FindingCreated");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_HuntRuns_ScheduledHuntId",
                schema: "Hunting",
                table: "Hunting_HuntRuns",
                column: "ScheduledHuntId");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_HuntRuns_Scope",
                schema: "Hunting",
                table: "Hunting_HuntRuns",
                columns: new[] { "ScopeType", "ScopeId" });

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_HuntRuns_StartedAt",
                schema: "Hunting",
                table: "Hunting_HuntRuns",
                column: "StartedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_HuntRuns_Status",
                schema: "Hunting",
                table: "Hunting_HuntRuns",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_HuntSampleRows_Dataset",
                schema: "Hunting",
                table: "Hunting_HuntSampleRows",
                column: "Dataset");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_HuntSampleRows_HuntRunId",
                schema: "Hunting",
                table: "Hunting_HuntSampleRows",
                column: "HuntRunId");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_HuntSampleRows_RowIndex",
                schema: "Hunting",
                table: "Hunting_HuntSampleRows",
                column: "RowIndex");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_SavedQueries_CreatedAt",
                schema: "Hunting",
                table: "Hunting_SavedQueries",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_SavedQueries_Dataset",
                schema: "Hunting",
                table: "Hunting_SavedQueries",
                column: "Dataset");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_SavedQueries_IsEnabled",
                schema: "Hunting",
                table: "Hunting_SavedQueries",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_SavedQueries_IsGlobalTemplate",
                schema: "Hunting",
                table: "Hunting_SavedQueries",
                column: "IsGlobalTemplate");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_SavedQueries_Scope",
                schema: "Hunting",
                table: "Hunting_SavedQueries",
                columns: new[] { "ScopeType", "ScopeId" });

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_ScheduledHunts_CreatedAt",
                schema: "Hunting",
                table: "Hunting_ScheduledHunts",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_ScheduledHunts_IsEnabled",
                schema: "Hunting",
                table: "Hunting_ScheduledHunts",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_ScheduledHunts_SavedQueryId",
                schema: "Hunting",
                table: "Hunting_ScheduledHunts",
                column: "SavedQueryId");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_ScheduledHunts_ScheduleSpec",
                schema: "Hunting",
                table: "Hunting_ScheduledHunts",
                column: "ScheduleSpec");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_ScheduledHunts_Scope",
                schema: "Hunting",
                table: "Hunting_ScheduledHunts",
                columns: new[] { "ScopeType", "ScopeId" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentEntities_EntityType_EntityId",
                schema: "Incidents",
                table: "Incidents_Entities",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentEntities_IncidentId",
                schema: "Incidents",
                table: "Incidents_Entities",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentEntities_IncidentId_EntityType",
                schema: "Incidents",
                table: "Incidents_Entities",
                columns: new[] { "IncidentId", "EntityType" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentEntities_IncidentId_Role",
                schema: "Incidents",
                table: "Incidents_Entities",
                columns: new[] { "IncidentId", "Role" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentEvents_IncidentId",
                schema: "Incidents",
                table: "Incidents_Events",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentEvents_IncidentId_EventType",
                schema: "Incidents",
                table: "Incidents_Events",
                columns: new[] { "IncidentId", "EventType" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentEvents_IncidentId_SourceModule",
                schema: "Incidents",
                table: "Incidents_Events",
                columns: new[] { "IncidentId", "SourceModule" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentEvents_IncidentId_Timestamp",
                schema: "Incidents",
                table: "Incidents_Events",
                columns: new[] { "IncidentId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId",
                schema: "Incidents",
                table: "Incidents_Incidents",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId_Category",
                schema: "Incidents",
                table: "Incidents_Incidents",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId_DetectedAt",
                schema: "Incidents",
                table: "Incidents_Incidents",
                columns: new[] { "TenantId", "DetectedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId_PrimaryAppId",
                schema: "Incidents",
                table: "Incidents_Incidents",
                columns: new[] { "TenantId", "PrimaryAppId" });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId_PrimaryUserId",
                schema: "Incidents",
                table: "Incidents_Incidents",
                columns: new[] { "TenantId", "PrimaryUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId_Severity",
                schema: "Incidents",
                table: "Incidents_Incidents",
                columns: new[] { "TenantId", "Severity" });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId_Status",
                schema: "Incidents",
                table: "Incidents_Incidents",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentNotes_IncidentId",
                schema: "Incidents",
                table: "Incidents_Notes",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentNotes_IncidentId_CreatedAt",
                schema: "Incidents",
                table: "Incidents_Notes",
                columns: new[] { "IncidentId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentNotes_IncidentId_CreatedByUserId",
                schema: "Incidents",
                table: "Incidents_Notes",
                columns: new[] { "IncidentId", "CreatedByUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentPlaybookRuns_IncidentId",
                schema: "Incidents",
                table: "Incidents_PlaybookRuns",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentPlaybookRuns_IncidentId_Status",
                schema: "Incidents",
                table: "Incidents_PlaybookRuns",
                columns: new[] { "IncidentId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentPlaybookRuns_IncidentId_WorkflowId",
                schema: "Incidents",
                table: "Incidents_PlaybookRuns",
                columns: new[] { "IncidentId", "WorkflowId" });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_TenantId_Severity_CreatedAt",
                schema: "IdentityInsights",
                table: "Insights",
                columns: new[] { "TenantId", "Severity", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_TenantId_Type_Status",
                schema: "IdentityInsights",
                table: "Insights",
                columns: new[] { "TenantId", "Type", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_ApplicationDailyUsageSnapshots_Date",
                schema: "Insights",
                table: "Insights_ApplicationDailyUsageSnapshots",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Insights_ApplicationDailyUsageSnapshots_TenantId_ApplicationId_Date",
                schema: "Insights",
                table: "Insights_ApplicationDailyUsageSnapshots",
                columns: new[] { "TenantId", "ApplicationId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Insights_ApplicationDailyUsageSnapshots_TenantId_Date",
                schema: "Insights",
                table: "Insights_ApplicationDailyUsageSnapshots",
                columns: new[] { "TenantId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_ReportSubscriptions_CreatedByUserId",
                schema: "Insights",
                table: "Insights_ReportSubscriptions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Insights_ReportSubscriptions_IsActive",
                schema: "Insights",
                table: "Insights_ReportSubscriptions",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Insights_ReportSubscriptions_ReportType",
                schema: "Insights",
                table: "Insights_ReportSubscriptions",
                column: "ReportType");

            migrationBuilder.CreateIndex(
                name: "IX_Insights_ReportSubscriptions_ScopeType_ScopeId",
                schema: "Insights",
                table: "Insights_ReportSubscriptions",
                columns: new[] { "ScopeType", "ScopeId" });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_TenantDailyUsageSnapshots_Date",
                schema: "Insights",
                table: "Insights_TenantDailyUsageSnapshots",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Insights_TenantDailyUsageSnapshots_TenantId_Date",
                schema: "Insights",
                table: "Insights_TenantDailyUsageSnapshots",
                columns: new[] { "TenantId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Insights_UserSecurityPostures_TenantId_HighRiskEvents",
                schema: "Insights",
                table: "Insights_UserSecurityPostures",
                columns: new[] { "TenantId", "HighRiskEventsLast30Days" });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_UserSecurityPostures_TenantId_LastSignInAt",
                schema: "Insights",
                table: "Insights_UserSecurityPostures",
                columns: new[] { "TenantId", "LastSignInAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_UserSecurityPostures_TenantId_MfaEnabled",
                schema: "Insights",
                table: "Insights_UserSecurityPostures",
                columns: new[] { "TenantId", "MfaEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_UserSecurityPostures_TenantId_UserId",
                schema: "Insights",
                table: "Insights_UserSecurityPostures",
                columns: new[] { "TenantId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JitGrants_TenantId_ExpiresAt",
                schema: "PrivilegedAccess",
                table: "JitGrants",
                columns: new[] { "TenantId", "ExpiresAt" });

            migrationBuilder.CreateIndex(
                name: "IX_JitGrants_TenantId_UserId_Status",
                schema: "PrivilegedAccess",
                table: "JitGrants",
                columns: new[] { "TenantId", "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JitProvisioningLogs_CreatedAt",
                table: "JitProvisioningLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_JitProvisioningLogs_OidcFederationProviderId",
                table: "JitProvisioningLogs",
                column: "OidcFederationProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_JitProvisioningLogs_SamlProviderId",
                table: "JitProvisioningLogs",
                column: "SamlProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_JitProvisioningLogs_TenantId",
                table: "JitProvisioningLogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JitProvisioningLogs_TenantId_UserId",
                table: "JitProvisioningLogs",
                columns: new[] { "TenantId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_KeyRotationPolicies_Enabled",
                schema: "Crypto",
                table: "KeyRotationPolicies",
                column: "Enabled");

            migrationBuilder.CreateIndex(
                name: "IX_KeyRotationPolicies_Scope_Purpose",
                schema: "Crypto",
                table: "KeyRotationPolicies",
                columns: new[] { "ScopeType", "ScopeId", "Purpose" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KeySets_Scope_Default",
                schema: "Crypto",
                table: "KeySets",
                columns: new[] { "ScopeType", "ScopeId", "IsDefaultForScope" });

            migrationBuilder.CreateIndex(
                name: "IX_KeySets_Scope_Purpose",
                schema: "Crypto",
                table: "KeySets",
                columns: new[] { "ScopeType", "ScopeId", "Purpose" });

            migrationBuilder.CreateIndex(
                name: "IX_KeyVersions_KeySetId",
                schema: "Crypto",
                table: "KeyVersions",
                column: "KeySetId");

            migrationBuilder.CreateIndex(
                name: "IX_KeyVersions_KeySetId_State",
                schema: "Crypto",
                table: "KeyVersions",
                columns: new[] { "KeySetId", "State" });

            migrationBuilder.CreateIndex(
                name: "IX_KeyVersions_Kid",
                schema: "Crypto",
                table: "KeyVersions",
                column: "Kid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LifecycleEvents_HRRecordId",
                schema: "IdentityLifecycle",
                table: "LifecycleEvents",
                column: "HRRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_LifecycleEvents_TenantId_Status_CreatedAt",
                schema: "IdentityLifecycle",
                table: "LifecycleEvents",
                columns: new[] { "TenantId", "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_LifecyclePolicies_TenantId",
                schema: "IdentityLifecycle",
                table: "LifecyclePolicies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LifecyclePolicies_TenantId_OrgUnitCode_JobRole",
                schema: "IdentityLifecycle",
                table: "LifecyclePolicies",
                columns: new[] { "TenantId", "OrgUnitCode", "JobRole" });

            migrationBuilder.CreateIndex(
                name: "IX_LoginHooks_TenantId_Stage_IsEnabled",
                schema: "Extensibility",
                table: "LoginHooks",
                columns: new[] { "TenantId", "Stage", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_MfaChallenges_ExpiresAt",
                table: "MfaChallenges",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_MfaChallenges_TenantUserId",
                table: "MfaChallenges",
                column: "TenantUserId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationChannelConfigs_TenantId_Channel",
                schema: "NotificationCenter",
                table: "NotificationChannelConfigs",
                columns: new[] { "TenantId", "Channel" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationDeliveryLogs_OutboxItemId",
                schema: "NotificationCenter",
                table: "NotificationDeliveryLogs",
                column: "OutboxItemId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationDeliveryLogs_TenantId_OutboxItemId",
                schema: "NotificationCenter",
                table: "NotificationDeliveryLogs",
                columns: new[] { "TenantId", "OutboxItemId" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationDeliveryLogs_Timestamp",
                schema: "NotificationCenter",
                table: "NotificationDeliveryLogs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationEventSubscriptions_TemplateId",
                schema: "NotificationCenter",
                table: "NotificationEventSubscriptions",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationEventSubscriptions_TenantId_EventType_IsEnabled",
                schema: "NotificationCenter",
                table: "NotificationEventSubscriptions",
                columns: new[] { "TenantId", "EventType", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationOutboxItems_CreatedAt",
                schema: "NotificationCenter",
                table: "NotificationOutboxItems",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationOutboxItems_Status_NextRetryAt",
                schema: "NotificationCenter",
                table: "NotificationOutboxItems",
                columns: new[] { "Status", "NextRetryAt" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationOutboxItems_TenantId_RecipientUserId",
                schema: "NotificationCenter",
                table: "NotificationOutboxItems",
                columns: new[] { "TenantId", "RecipientUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationTemplates_TenantId",
                schema: "NotificationCenter",
                table: "NotificationTemplates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationTemplates_TenantId_TemplateKey_Channel_Locale",
                schema: "NotificationCenter",
                table: "NotificationTemplates",
                columns: new[] { "TenantId", "TemplateKey", "Channel", "Locale" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ObservabilityAuditEvents_ActorId_OccurredAt",
                table: "ObservabilityAuditEvents",
                columns: new[] { "ActorId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ObservabilityAuditEvents_CorrelationId",
                table: "ObservabilityAuditEvents",
                column: "CorrelationId");

            migrationBuilder.CreateIndex(
                name: "IX_ObservabilityAuditEvents_OccurredAt",
                table: "ObservabilityAuditEvents",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_ObservabilityAuditEvents_TenantId_Category_OccurredAt",
                table: "ObservabilityAuditEvents",
                columns: new[] { "TenantId", "Category", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ObservabilityAuditEvents_TenantId_OccurredAt",
                table: "ObservabilityAuditEvents",
                columns: new[] { "TenantId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OidcFederationProviders_TenantId",
                table: "OidcFederationProviders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_OidcFederationProviders_TenantId_Name",
                table: "OidcFederationProviders",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_OrgUnitMfaRules_TenantId",
                table: "OrgUnitMfaRules",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_OrgUnitMfaRules_TenantId_OrgUnitId",
                table: "OrgUnitMfaRules",
                columns: new[] { "TenantId", "OrgUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrgUnits_ParentId",
                table: "OrgUnits",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_OrgUnits_TenantId",
                table: "OrgUnits",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_OrgUnits_TenantId_Code",
                table: "OrgUnits",
                columns: new[] { "TenantId", "Code" },
                unique: true,
                filter: "[Code] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OrgUnits_TenantId_Path",
                table: "OrgUnits",
                columns: new[] { "TenantId", "Path" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_Token",
                table: "PasswordResetTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlanFeatures_PlanId",
                table: "PlanFeatures",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanFeatures_PlanId_Key",
                table: "PlanFeatures",
                columns: new[] { "PlanId", "Key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Plans_Code",
                table: "Plans",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Platform_IntegrationTestResults_Category",
                schema: "Platform",
                table: "Platform_IntegrationTestResults",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_IntegrationTestResults_StartedAt",
                schema: "Platform",
                table: "Platform_IntegrationTestResults",
                column: "StartedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_IntegrationTestResults_Status",
                schema: "Platform",
                table: "Platform_IntegrationTestResults",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_IntegrationTestResults_TestSuiteId",
                schema: "Platform",
                table: "Platform_IntegrationTestResults",
                column: "TestSuiteId");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_IntegrationTestResults_TestSuiteId_Status",
                schema: "Platform",
                table: "Platform_IntegrationTestResults",
                columns: new[] { "TestSuiteId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Platform_MigrationHistory_AppliedAt",
                schema: "Platform",
                table: "Platform_MigrationHistory",
                column: "AppliedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_MigrationHistory_AppliedByUserId",
                schema: "Platform",
                table: "Platform_MigrationHistory",
                column: "AppliedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_MigrationHistory_MigrationName",
                schema: "Platform",
                table: "Platform_MigrationHistory",
                column: "MigrationName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Platform_MigrationHistory_Status",
                schema: "Platform",
                table: "Platform_MigrationHistory",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_Versions_IsCurrentVersion",
                schema: "Platform",
                table: "Platform_Versions",
                column: "IsCurrentVersion");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_Versions_ReleaseDate",
                schema: "Platform",
                table: "Platform_Versions",
                column: "ReleaseDate");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_Versions_Version",
                schema: "Platform",
                table: "Platform_Versions",
                column: "Version",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PolicyAssignments_PolicyDefinitionId",
                table: "PolicyAssignments",
                column: "PolicyDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyAssignments_PolicyTargetId",
                table: "PolicyAssignments",
                column: "PolicyTargetId");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyAssignments_TenantId_PolicyTargetId_Order",
                table: "PolicyAssignments",
                columns: new[] { "TenantId", "PolicyTargetId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_PolicyConditionGroups_PolicyDefinitionId",
                table: "PolicyConditionGroups",
                column: "PolicyDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyConditions_ConditionGroupId",
                table: "PolicyConditions",
                column: "ConditionGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyDefinitions_TenantId",
                table: "PolicyDefinitions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyDefinitions_TenantId_Enabled_Priority",
                table: "PolicyDefinitions",
                columns: new[] { "TenantId", "Enabled", "Priority" });

            migrationBuilder.CreateIndex(
                name: "IX_PolicyTargets_TenantId",
                table: "PolicyTargets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyTargets_TenantId_TargetType_TargetKey",
                table: "PolicyTargets",
                columns: new[] { "TenantId", "TargetType", "TargetKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrivilegedSessions_TenantId_IsActive",
                schema: "PrivilegedAccess",
                table: "PrivilegedSessions",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_PrivilegedSessions_TenantId_UserId_IsActive",
                schema: "PrivilegedAccess",
                table: "PrivilegedSessions",
                columns: new[] { "TenantId", "UserId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_RegionBackupSets_RegionId",
                schema: "MultiRegion",
                table: "RegionBackupSets",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_RegionBackupSets_RegionId_CreatedAt",
                schema: "MultiRegion",
                table: "RegionBackupSets",
                columns: new[] { "RegionId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Regions_IsActive",
                schema: "MultiRegion",
                table: "Regions",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_RiskEvents_TenantId",
                table: "RiskEvents",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RiskEvents_TenantId_CreatedAt_RiskLevel",
                table: "RiskEvents",
                columns: new[] { "TenantId", "CreatedAt", "RiskLevel" });

            migrationBuilder.CreateIndex(
                name: "IX_SamlProviders_TenantId",
                table: "SamlProviders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SamlProviders_TenantId_EntityId",
                table: "SamlProviders",
                columns: new[] { "TenantId", "EntityId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScimTokens_TenantId",
                table: "ScimTokens",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ScimTokens_TenantId_Status",
                table: "ScimTokens",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ScimTokens_TokenHash",
                table: "ScimTokens",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SdkConfigurations_TenantId_SdkType",
                table: "SdkConfigurations",
                columns: new[] { "TenantId", "SdkType" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityPolicies_TenantId",
                table: "SecurityPolicies",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SecuritySignals_TenantId",
                schema: "AdaptiveSecurity",
                table: "SecuritySignals",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SecuritySignals_TenantId_DetectedAt",
                schema: "AdaptiveSecurity",
                table: "SecuritySignals",
                columns: new[] { "TenantId", "DetectedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SecuritySignals_TenantId_ProcessedAt",
                schema: "AdaptiveSecurity",
                table: "SecuritySignals",
                columns: new[] { "TenantId", "ProcessedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SecuritySignals_TenantId_SignalType",
                schema: "AdaptiveSecurity",
                table: "SecuritySignals",
                columns: new[] { "TenantId", "SignalType" });

            migrationBuilder.CreateIndex(
                name: "IX_SecuritySignals_TenantId_UserId",
                schema: "AdaptiveSecurity",
                table: "SecuritySignals",
                columns: new[] { "TenantId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAccounts_TenantId_Email",
                table: "ServiceAccounts",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAccounts_TenantId_Status",
                table: "ServiceAccounts",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackupSets_TenantId",
                schema: "MultiRegion",
                table: "TenantBackupSets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackupSets_TenantId_CreatedAt",
                schema: "MultiRegion",
                table: "TenantBackupSets",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantConfigs_TenantId",
                table: "TenantConfigs",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantDataResidencies_DataRegionId",
                schema: "MultiRegion",
                table: "TenantDataResidencies",
                column: "DataRegionId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDataResidencies_TenantId",
                schema: "MultiRegion",
                table: "TenantDataResidencies",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantRiskProfiles_RiskScore",
                schema: "IdentityInsights",
                table: "TenantRiskProfiles",
                column: "RiskScore");

            migrationBuilder.CreateIndex(
                name: "IX_TenantRiskProfiles_TenantId",
                schema: "IdentityInsights",
                table: "TenantRiskProfiles",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Slug",
                table: "Tenants",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantSubscriptions_PlanId",
                table: "TenantSubscriptions",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSubscriptions_Status",
                table: "TenantSubscriptions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSubscriptions_TenantId",
                table: "TenantSubscriptions",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsageSnapshots_TenantId",
                table: "TenantUsageSnapshots",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsageSnapshots_TenantId_CapturedAt",
                table: "TenantUsageSnapshots",
                columns: new[] { "TenantId", "CapturedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_GlobalUserId_TenantId",
                table: "TenantUsers",
                columns: new[] { "GlobalUserId", "TenantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TokenTransformationRules_TenantId_Order",
                schema: "Extensibility",
                table: "TokenTransformationRules",
                columns: new[] { "TenantId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_TokenTransformationRules_TenantId_TargetAppId_IsEnabled",
                schema: "Extensibility",
                table: "TokenTransformationRules",
                columns: new[] { "TenantId", "TargetAppId", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_TrustedDevices_ExpiresAt",
                table: "TrustedDevices",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_TrustedDevices_TenantUserId_DeviceId",
                table: "TrustedDevices",
                columns: new[] { "TenantUserId", "DeviceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UsageCounters_TenantId",
                table: "UsageCounters",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_UsageCounters_TenantId_MetricType_PeriodYear_PeriodMonth",
                table: "UsageCounters",
                columns: new[] { "TenantId", "MetricType", "PeriodYear", "PeriodMonth" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserLoginSessions_SessionToken",
                table: "UserLoginSessions",
                column: "SessionToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserMfaMethods_TenantUserId",
                table: "UserMfaMethods",
                column: "TenantUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserMfaMethods_TenantUserId_MethodType_IsPrimary",
                table: "UserMfaMethods",
                columns: new[] { "TenantUserId", "MethodType", "IsPrimary" });

            migrationBuilder.CreateIndex(
                name: "IX_UserOrgUnits_OrgUnitId",
                table: "UserOrgUnits",
                column: "OrgUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOrgUnits_TenantUserId",
                table: "UserOrgUnits",
                column: "TenantUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRiskProfiles_TenantId_RiskScore",
                schema: "IdentityInsights",
                table: "UserRiskProfiles",
                columns: new[] { "TenantId", "RiskScore" });

            migrationBuilder.CreateIndex(
                name: "IX_UserRiskProfiles_TenantId_UserId",
                schema: "IdentityInsights",
                table: "UserRiskProfiles",
                columns: new[] { "TenantId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSecurityContexts_TenantId_CurrentRiskScore",
                schema: "AdaptiveSecurity",
                table: "UserSecurityContexts",
                columns: new[] { "TenantId", "CurrentRiskScore" });

            migrationBuilder.CreateIndex(
                name: "IX_UserSecurityContexts_TenantId_UserId",
                schema: "AdaptiveSecurity",
                table: "UserSecurityContexts",
                columns: new[] { "TenantId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WebhookDeliveryLogs_SubscriptionId_CreatedAt",
                schema: "Extensibility",
                table: "WebhookDeliveryLogs",
                columns: new[] { "SubscriptionId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_WebhookDeliveryLogs_TenantId_Status",
                schema: "Extensibility",
                table: "WebhookDeliveryLogs",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_WebhookDeliveryLogs_TenantId_Status_AttemptCount",
                schema: "Extensibility",
                table: "WebhookDeliveryLogs",
                columns: new[] { "TenantId", "Status", "AttemptCount" });

            migrationBuilder.CreateIndex(
                name: "IX_WebhookEndpoints_TenantId_Enabled",
                table: "WebhookEndpoints",
                columns: new[] { "TenantId", "Enabled" });

            migrationBuilder.CreateIndex(
                name: "IX_WebhookSubscriptions_TenantId_IsEnabled",
                schema: "Extensibility",
                table: "WebhookSubscriptions",
                columns: new[] { "TenantId", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowDefinitions_TenantId_TargetType_TargetId",
                schema: "AccessRequests",
                table: "WorkflowDefinitions",
                columns: new[] { "TenantId", "TargetType", "TargetId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccessPackages",
                schema: "IdentityLifecycle");

            migrationBuilder.DropTable(
                name: "AccessRequestItems",
                schema: "AccessRequests");

            migrationBuilder.DropTable(
                name: "AdaptivePolicies",
                schema: "AdaptiveSecurity");

            migrationBuilder.DropTable(
                name: "ApiKeys");

            migrationBuilder.DropTable(
                name: "ApiUsageLogs");

            migrationBuilder.DropTable(
                name: "ApplicationOrgUnits");

            migrationBuilder.DropTable(
                name: "ApprovalSteps",
                schema: "AccessRequests");

            migrationBuilder.DropTable(
                name: "AttributeMappings");

            migrationBuilder.DropTable(
                name: "AuditEvents");

            migrationBuilder.DropTable(
                name: "AuthorizationCodes");

            migrationBuilder.DropTable(
                name: "Automation_Actions",
                schema: "Automation");

            migrationBuilder.DropTable(
                name: "Automation_Conditions",
                schema: "Automation");

            migrationBuilder.DropTable(
                name: "Automation_Executions",
                schema: "Automation");

            migrationBuilder.DropTable(
                name: "Automation_Triggers",
                schema: "Automation");

            migrationBuilder.DropTable(
                name: "BreakGlassAccounts",
                schema: "PrivilegedAccess");

            migrationBuilder.DropTable(
                name: "ChangeMgmt_ApprovalRules",
                schema: "ChangeMgmt");

            migrationBuilder.DropTable(
                name: "ChangeMgmt_Approvals",
                schema: "ChangeMgmt");

            migrationBuilder.DropTable(
                name: "ChangeMgmt_ChangeItems",
                schema: "ChangeMgmt");

            migrationBuilder.DropTable(
                name: "ChangeMgmt_ExecutionLogs",
                schema: "ChangeMgmt");

            migrationBuilder.DropTable(
                name: "ClientRedirectUris");

            migrationBuilder.DropTable(
                name: "ClientSecrets");

            migrationBuilder.DropTable(
                name: "DataRetentionPolicies",
                schema: "Privacy");

            migrationBuilder.DropTable(
                name: "DataSubjectRequests",
                schema: "Privacy");

            migrationBuilder.DropTable(
                name: "DelegatedAdminScopes");

            migrationBuilder.DropTable(
                name: "EnvironmentFeatureConfigs",
                schema: "Deployment");

            migrationBuilder.DropTable(
                name: "ExternalLogins");

            migrationBuilder.DropTable(
                name: "Global_Environments",
                schema: "Deployment");

            migrationBuilder.DropTable(
                name: "GlobalUsers");

            migrationBuilder.DropTable(
                name: "Hunting_HuntSampleRows",
                schema: "Hunting");

            migrationBuilder.DropTable(
                name: "Incidents_Entities",
                schema: "Incidents");

            migrationBuilder.DropTable(
                name: "Incidents_Events",
                schema: "Incidents");

            migrationBuilder.DropTable(
                name: "Incidents_Incidents",
                schema: "Incidents");

            migrationBuilder.DropTable(
                name: "Incidents_Notes",
                schema: "Incidents");

            migrationBuilder.DropTable(
                name: "Incidents_PlaybookRuns",
                schema: "Incidents");

            migrationBuilder.DropTable(
                name: "Insights",
                schema: "IdentityInsights");

            migrationBuilder.DropTable(
                name: "Insights_ApplicationDailyUsageSnapshots",
                schema: "Insights");

            migrationBuilder.DropTable(
                name: "Insights_ReportSubscriptions",
                schema: "Insights");

            migrationBuilder.DropTable(
                name: "Insights_TenantDailyUsageSnapshots",
                schema: "Insights");

            migrationBuilder.DropTable(
                name: "Insights_UserSecurityPostures",
                schema: "Insights");

            migrationBuilder.DropTable(
                name: "JitGrants",
                schema: "PrivilegedAccess");

            migrationBuilder.DropTable(
                name: "JitProvisioningLogs");

            migrationBuilder.DropTable(
                name: "KeyRotationPolicies",
                schema: "Crypto");

            migrationBuilder.DropTable(
                name: "KeySets",
                schema: "Crypto");

            migrationBuilder.DropTable(
                name: "KeyVersions",
                schema: "Crypto");

            migrationBuilder.DropTable(
                name: "LifecycleEvents",
                schema: "IdentityLifecycle");

            migrationBuilder.DropTable(
                name: "LifecyclePolicies",
                schema: "IdentityLifecycle");

            migrationBuilder.DropTable(
                name: "LoginHooks",
                schema: "Extensibility");

            migrationBuilder.DropTable(
                name: "MfaChallenges");

            migrationBuilder.DropTable(
                name: "NotificationChannelConfigs",
                schema: "NotificationCenter");

            migrationBuilder.DropTable(
                name: "NotificationDeliveryLogs",
                schema: "NotificationCenter");

            migrationBuilder.DropTable(
                name: "NotificationEventSubscriptions",
                schema: "NotificationCenter");

            migrationBuilder.DropTable(
                name: "ObservabilityAuditEvents");

            migrationBuilder.DropTable(
                name: "OrgUnitMfaRules");

            migrationBuilder.DropTable(
                name: "PasswordResetTokens");

            migrationBuilder.DropTable(
                name: "PlanFeatures");

            migrationBuilder.DropTable(
                name: "Platform_IntegrationTestResults",
                schema: "Platform");

            migrationBuilder.DropTable(
                name: "Platform_MigrationHistory",
                schema: "Platform");

            migrationBuilder.DropTable(
                name: "Platform_Versions",
                schema: "Platform");

            migrationBuilder.DropTable(
                name: "PolicyAssignments");

            migrationBuilder.DropTable(
                name: "PolicyConditions");

            migrationBuilder.DropTable(
                name: "PrivilegedSessions",
                schema: "PrivilegedAccess");

            migrationBuilder.DropTable(
                name: "RegionBackupSets",
                schema: "MultiRegion");

            migrationBuilder.DropTable(
                name: "Regions",
                schema: "MultiRegion");

            migrationBuilder.DropTable(
                name: "RiskEvents");

            migrationBuilder.DropTable(
                name: "ScimTokens");

            migrationBuilder.DropTable(
                name: "SdkConfigurations");

            migrationBuilder.DropTable(
                name: "SecurityPolicies");

            migrationBuilder.DropTable(
                name: "SecuritySignals",
                schema: "AdaptiveSecurity");

            migrationBuilder.DropTable(
                name: "TenantBackupSets",
                schema: "MultiRegion");

            migrationBuilder.DropTable(
                name: "TenantConfigs");

            migrationBuilder.DropTable(
                name: "TenantDataResidencies",
                schema: "MultiRegion");

            migrationBuilder.DropTable(
                name: "TenantRiskProfiles",
                schema: "IdentityInsights");

            migrationBuilder.DropTable(
                name: "TenantSubscriptions");

            migrationBuilder.DropTable(
                name: "TenantUsageSnapshots");

            migrationBuilder.DropTable(
                name: "TokenTransformationRules",
                schema: "Extensibility");

            migrationBuilder.DropTable(
                name: "TrustedDevices");

            migrationBuilder.DropTable(
                name: "UsageCounters");

            migrationBuilder.DropTable(
                name: "UserLoginSessions");

            migrationBuilder.DropTable(
                name: "UserMfaMethods");

            migrationBuilder.DropTable(
                name: "UserOrgUnits");

            migrationBuilder.DropTable(
                name: "UserRiskProfiles",
                schema: "IdentityInsights");

            migrationBuilder.DropTable(
                name: "UserSecurityContexts",
                schema: "AdaptiveSecurity");

            migrationBuilder.DropTable(
                name: "WebhookDeliveryLogs",
                schema: "Extensibility");

            migrationBuilder.DropTable(
                name: "WebhookEndpoints");

            migrationBuilder.DropTable(
                name: "WebhookSubscriptions",
                schema: "Extensibility");

            migrationBuilder.DropTable(
                name: "WorkflowDefinitions",
                schema: "AccessRequests");

            migrationBuilder.DropTable(
                name: "ServiceAccounts");

            migrationBuilder.DropTable(
                name: "ApplicationClients");

            migrationBuilder.DropTable(
                name: "AccessRequests",
                schema: "AccessRequests");

            migrationBuilder.DropTable(
                name: "Automation_Workflows",
                schema: "Automation");

            migrationBuilder.DropTable(
                name: "ChangeMgmt_ChangeSets",
                schema: "ChangeMgmt");

            migrationBuilder.DropTable(
                name: "Hunting_HuntRuns",
                schema: "Hunting");

            migrationBuilder.DropTable(
                name: "OidcFederationProviders");

            migrationBuilder.DropTable(
                name: "SamlProviders");

            migrationBuilder.DropTable(
                name: "HRIdentityRecords",
                schema: "IdentityLifecycle");

            migrationBuilder.DropTable(
                name: "NotificationOutboxItems",
                schema: "NotificationCenter");

            migrationBuilder.DropTable(
                name: "NotificationTemplates",
                schema: "NotificationCenter");

            migrationBuilder.DropTable(
                name: "PolicyTargets");

            migrationBuilder.DropTable(
                name: "PolicyConditionGroups");

            migrationBuilder.DropTable(
                name: "Plans");

            migrationBuilder.DropTable(
                name: "OrgUnits");

            migrationBuilder.DropTable(
                name: "TenantUsers");

            migrationBuilder.DropTable(
                name: "Hunting_ScheduledHunts",
                schema: "Hunting");

            migrationBuilder.DropTable(
                name: "PolicyDefinitions");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropTable(
                name: "Hunting_SavedQueries",
                schema: "Hunting");
        }
    }
}
