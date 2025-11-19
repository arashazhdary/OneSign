using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onesign.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPhase24To30Modules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create schemas
            migrationBuilder.Sql("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Platform') EXEC('CREATE SCHEMA Platform')");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Insights') EXEC('CREATE SCHEMA Insights')");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'ChangeMgmt') EXEC('CREATE SCHEMA ChangeMgmt')");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Incidents') EXEC('CREATE SCHEMA Incidents')");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Hunting') EXEC('CREATE SCHEMA Hunting')");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Copilot') EXEC('CREATE SCHEMA Copilot')");
            migrationBuilder.Sql("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Automation') EXEC('CREATE SCHEMA Automation')");

            // ==================== PHASE 24: Platform Module ====================

            // Platform_Versions table
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

            migrationBuilder.CreateIndex(
                name: "IX_Platform_Versions_Version",
                schema: "Platform",
                table: "Platform_Versions",
                column: "Version",
                unique: true);

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

            // Platform_MigrationHistory table
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
                name: "IX_Platform_MigrationHistory_AppliedAt",
                schema: "Platform",
                table: "Platform_MigrationHistory",
                column: "AppliedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_MigrationHistory_AppliedByUserId",
                schema: "Platform",
                table: "Platform_MigrationHistory",
                column: "AppliedByUserId");

            // Platform_IntegrationTestResults table
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

            migrationBuilder.CreateIndex(
                name: "IX_Platform_IntegrationTestResults_TestSuiteId",
                schema: "Platform",
                table: "Platform_IntegrationTestResults",
                column: "TestSuiteId");

            migrationBuilder.CreateIndex(
                name: "IX_Platform_IntegrationTestResults_Status",
                schema: "Platform",
                table: "Platform_IntegrationTestResults",
                column: "Status");

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
                name: "IX_Platform_IntegrationTestResults_TestSuiteId_Status",
                schema: "Platform",
                table: "Platform_IntegrationTestResults",
                columns: new[] { "TestSuiteId", "Status" });

            // ==================== PHASE 25: Insights Module ====================

            // Insights_TenantDailyUsageSnapshots table
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
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insights_TenantDailyUsageSnapshots", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_TenantDailyUsageSnapshots_TenantId_Date",
                schema: "Insights",
                table: "Insights_TenantDailyUsageSnapshots",
                columns: new[] { "TenantId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Insights_TenantDailyUsageSnapshots_Date",
                schema: "Insights",
                table: "Insights_TenantDailyUsageSnapshots",
                column: "Date");

            // Insights_ApplicationDailyUsageSnapshots table
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
                name: "IX_Insights_ApplicationDailyUsageSnapshots_Date",
                schema: "Insights",
                table: "Insights_ApplicationDailyUsageSnapshots",
                column: "Date");

            // Insights_UserSecurityPostures table
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

            migrationBuilder.CreateIndex(
                name: "IX_Insights_UserSecurityPostures_TenantId_UserId",
                schema: "Insights",
                table: "Insights_UserSecurityPostures",
                columns: new[] { "TenantId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Insights_UserSecurityPostures_TenantId_HighRiskEvents",
                schema: "Insights",
                table: "Insights_UserSecurityPostures",
                columns: new[] { "TenantId", "HighRiskEventsLast30Days" });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_UserSecurityPostures_TenantId_MfaEnabled",
                schema: "Insights",
                table: "Insights_UserSecurityPostures",
                columns: new[] { "TenantId", "MfaEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_Insights_UserSecurityPostures_TenantId_LastSignInAt",
                schema: "Insights",
                table: "Insights_UserSecurityPostures",
                columns: new[] { "TenantId", "LastSignInAt" });

            // Insights_ReportSubscriptions table
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

            migrationBuilder.CreateIndex(
                name: "IX_Insights_ReportSubscriptions_ScopeType_ScopeId",
                schema: "Insights",
                table: "Insights_ReportSubscriptions",
                columns: new[] { "ScopeType", "ScopeId" });

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
                name: "IX_Insights_ReportSubscriptions_CreatedByUserId",
                schema: "Insights",
                table: "Insights_ReportSubscriptions",
                column: "CreatedByUserId");

            // ==================== PHASE 26: Automation Module ====================

            // Automation_Workflows table
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
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Automation_Workflows", x => x.Id);
                });

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
                name: "IX_Automation_Workflows_ScopeType_IsTemplate_IsEnforced",
                schema: "Automation",
                table: "Automation_Workflows",
                columns: new[] { "ScopeType", "IsTemplate", "IsEnforced" });

            // Automation_Triggers table
            migrationBuilder.CreateTable(
                name: "Automation_Triggers",
                schema: "Automation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SourceModule = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
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

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Triggers_WorkflowId",
                schema: "Automation",
                table: "Automation_Triggers",
                column: "WorkflowId");

            // Automation_Conditions table
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

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Conditions_WorkflowId",
                schema: "Automation",
                table: "Automation_Conditions",
                column: "WorkflowId");

            // Automation_Actions table
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

            migrationBuilder.CreateIndex(
                name: "IX_Automation_Actions_WorkflowId",
                schema: "Automation",
                table: "Automation_Actions",
                column: "WorkflowId");

            // ==================== PHASE 27: Change Management Module ====================

            // ChangeMgmt_ChangeSets table
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
                name: "IX_ChangeMgmt_ChangeSets_RequestedBy",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeSets",
                column: "RequestedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeSets_CreatedAt",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeSets",
                column: "CreatedAt");

            // ChangeMgmt_ChangeItems table
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

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeItems_ChangeSetId",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeItems",
                column: "ChangeSetId");

            // ChangeMgmt_ChangeApprovals table
            migrationBuilder.CreateTable(
                name: "ChangeMgmt_ChangeApprovals",
                schema: "ChangeMgmt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChangeSetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApproverUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Decision = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DecidedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeMgmt_ChangeApprovals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeMgmt_ChangeApprovals_ChangeMgmt_ChangeSets_ChangeSetId",
                        column: x => x.ChangeSetId,
                        principalSchema: "ChangeMgmt",
                        principalTable: "ChangeMgmt_ChangeSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeApprovals_ChangeSetId",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeApprovals",
                column: "ChangeSetId");

            // ChangeMgmt_ChangeApprovalRules table
            migrationBuilder.CreateTable(
                name: "ChangeMgmt_ChangeApprovalRules",
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
                    table.PrimaryKey("PK_ChangeMgmt_ChangeApprovalRules", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeApprovalRules_Scope_Category",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeApprovalRules",
                columns: new[] { "ScopeType", "ScopeId", "Category" },
                unique: true);

            // ChangeMgmt_ChangeExecutionLogs table
            migrationBuilder.CreateTable(
                name: "ChangeMgmt_ChangeExecutionLogs",
                schema: "ChangeMgmt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChangeSetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Step = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeMgmt_ChangeExecutionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeMgmt_ChangeExecutionLogs_ChangeMgmt_ChangeSets_ChangeSetId",
                        column: x => x.ChangeSetId,
                        principalSchema: "ChangeMgmt",
                        principalTable: "ChangeMgmt_ChangeSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChangeMgmt_ChangeExecutionLogs_ChangeSetId",
                schema: "ChangeMgmt",
                table: "ChangeMgmt_ChangeExecutionLogs",
                column: "ChangeSetId");

            // ==================== PHASE 28: Incidents Module ====================

            // Incidents_Incidents table
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
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents_Incidents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId",
                schema: "Incidents",
                table: "Incidents_Incidents",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId_Status",
                schema: "Incidents",
                table: "Incidents_Incidents",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId_Severity",
                schema: "Incidents",
                table: "Incidents_Incidents",
                columns: new[] { "TenantId", "Severity" });

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
                name: "IX_Incidents_TenantId_PrimaryUserId",
                schema: "Incidents",
                table: "Incidents_Incidents",
                columns: new[] { "TenantId", "PrimaryUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_TenantId_PrimaryAppId",
                schema: "Incidents",
                table: "Incidents_Incidents",
                columns: new[] { "TenantId", "PrimaryAppId" });

            // Incidents_IncidentEvents table
            migrationBuilder.CreateTable(
                name: "Incidents_IncidentEvents",
                schema: "Incidents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EventData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SourceModule = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents_IncidentEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_IncidentEvents_IncidentId",
                schema: "Incidents",
                table: "Incidents_IncidentEvents",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_IncidentEvents_Timestamp",
                schema: "Incidents",
                table: "Incidents_IncidentEvents",
                column: "Timestamp");

            // Incidents_IncidentNotes table
            migrationBuilder.CreateTable(
                name: "Incidents_IncidentNotes",
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
                    table.PrimaryKey("PK_Incidents_IncidentNotes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_IncidentNotes_IncidentId",
                schema: "Incidents",
                table: "Incidents_IncidentNotes",
                column: "IncidentId");

            // Incidents_IncidentLinkedEntities table
            migrationBuilder.CreateTable(
                name: "Incidents_IncidentLinkedEntities",
                schema: "Incidents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityType = table.Column<int>(type: "int", nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents_IncidentLinkedEntities", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_IncidentLinkedEntities_IncidentId",
                schema: "Incidents",
                table: "Incidents_IncidentLinkedEntities",
                column: "IncidentId");

            // Incidents_IncidentPlaybookRuns table
            migrationBuilder.CreateTable(
                name: "Incidents_IncidentPlaybookRuns",
                schema: "Incidents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkflowName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Result = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents_IncidentPlaybookRuns", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_IncidentPlaybookRuns_IncidentId",
                schema: "Incidents",
                table: "Incidents_IncidentPlaybookRuns",
                column: "IncidentId");

            // ==================== PHASE 29: Hunting Module ====================

            // Hunting_SavedQueries table
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

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_SavedQueries_Scope",
                schema: "Hunting",
                table: "Hunting_SavedQueries",
                columns: new[] { "ScopeType", "ScopeId" });

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_SavedQueries_Dataset",
                schema: "Hunting",
                table: "Hunting_SavedQueries",
                column: "Dataset");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_SavedQueries_IsGlobalTemplate",
                schema: "Hunting",
                table: "Hunting_SavedQueries",
                column: "IsGlobalTemplate");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_SavedQueries_IsEnabled",
                schema: "Hunting",
                table: "Hunting_SavedQueries",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_SavedQueries_CreatedAt",
                schema: "Hunting",
                table: "Hunting_SavedQueries",
                column: "CreatedAt");

            // Hunting_ScheduledHunts table
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

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_ScheduledHunts_SavedQueryId",
                schema: "Hunting",
                table: "Hunting_ScheduledHunts",
                column: "SavedQueryId");

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_ScheduledHunts_Scope",
                schema: "Hunting",
                table: "Hunting_ScheduledHunts",
                columns: new[] { "ScopeType", "ScopeId" });

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_ScheduledHunts_IsEnabled",
                schema: "Hunting",
                table: "Hunting_ScheduledHunts",
                column: "IsEnabled");

            // Hunting_HuntRuns table
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
                    ErrorMessage = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
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

            migrationBuilder.CreateIndex(
                name: "IX_Hunting_HuntRuns_ScheduledHuntId",
                schema: "Hunting",
                table: "Hunting_HuntRuns",
                column: "ScheduledHuntId");

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

            // Hunting_HuntSampleRows table
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
                name: "IX_Hunting_HuntSampleRows_HuntRunId",
                schema: "Hunting",
                table: "Hunting_HuntSampleRows",
                column: "HuntRunId");

            // ==================== PHASE 30: Copilot Module ====================

            // Copilot_Conversations table
            migrationBuilder.CreateTable(
                name: "Copilot_Conversations",
                schema: "Copilot",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastMessageAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Copilot_Conversations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Copilot_Conversations_TenantId",
                schema: "Copilot",
                table: "Copilot_Conversations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Copilot_Conversations_TenantId_UserId",
                schema: "Copilot",
                table: "Copilot_Conversations",
                columns: new[] { "TenantId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_Copilot_Conversations_TenantId_UserId_LastMessageAt",
                schema: "Copilot",
                table: "Copilot_Conversations",
                columns: new[] { "TenantId", "UserId", "LastMessageAt" });

            // Copilot_Messages table
            migrationBuilder.CreateTable(
                name: "Copilot_Messages",
                schema: "Copilot",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContextType = table.Column<int>(type: "int", nullable: false),
                    ContextId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SuggestedActionsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Copilot_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Copilot_Messages_Copilot_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalSchema: "Copilot",
                        principalTable: "Copilot_Conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Copilot_Messages_ConversationId",
                schema: "Copilot",
                table: "Copilot_Messages",
                column: "ConversationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop Phase 30 tables
            migrationBuilder.DropTable(name: "Copilot_Messages", schema: "Copilot");
            migrationBuilder.DropTable(name: "Copilot_Conversations", schema: "Copilot");

            // Drop Phase 29 tables
            migrationBuilder.DropTable(name: "Hunting_HuntSampleRows", schema: "Hunting");
            migrationBuilder.DropTable(name: "Hunting_HuntRuns", schema: "Hunting");
            migrationBuilder.DropTable(name: "Hunting_ScheduledHunts", schema: "Hunting");
            migrationBuilder.DropTable(name: "Hunting_SavedQueries", schema: "Hunting");

            // Drop Phase 28 tables
            migrationBuilder.DropTable(name: "Incidents_IncidentPlaybookRuns", schema: "Incidents");
            migrationBuilder.DropTable(name: "Incidents_IncidentLinkedEntities", schema: "Incidents");
            migrationBuilder.DropTable(name: "Incidents_IncidentNotes", schema: "Incidents");
            migrationBuilder.DropTable(name: "Incidents_IncidentEvents", schema: "Incidents");
            migrationBuilder.DropTable(name: "Incidents_Incidents", schema: "Incidents");

            // Drop Phase 27 tables
            migrationBuilder.DropTable(name: "ChangeMgmt_ChangeExecutionLogs", schema: "ChangeMgmt");
            migrationBuilder.DropTable(name: "ChangeMgmt_ChangeApprovalRules", schema: "ChangeMgmt");
            migrationBuilder.DropTable(name: "ChangeMgmt_ChangeApprovals", schema: "ChangeMgmt");
            migrationBuilder.DropTable(name: "ChangeMgmt_ChangeItems", schema: "ChangeMgmt");
            migrationBuilder.DropTable(name: "ChangeMgmt_ChangeSets", schema: "ChangeMgmt");

            // Drop Phase 26 tables
            migrationBuilder.DropTable(name: "Automation_Actions", schema: "Automation");
            migrationBuilder.DropTable(name: "Automation_Conditions", schema: "Automation");
            migrationBuilder.DropTable(name: "Automation_Triggers", schema: "Automation");
            migrationBuilder.DropTable(name: "Automation_Workflows", schema: "Automation");

            // Drop Phase 25 tables
            migrationBuilder.DropTable(name: "Insights_ReportSubscriptions", schema: "Insights");
            migrationBuilder.DropTable(name: "Insights_UserSecurityPostures", schema: "Insights");
            migrationBuilder.DropTable(name: "Insights_ApplicationDailyUsageSnapshots", schema: "Insights");
            migrationBuilder.DropTable(name: "Insights_TenantDailyUsageSnapshots", schema: "Insights");

            // Drop Phase 24 tables
            migrationBuilder.DropTable(name: "Platform_IntegrationTestResults", schema: "Platform");
            migrationBuilder.DropTable(name: "Platform_MigrationHistory", schema: "Platform");
            migrationBuilder.DropTable(name: "Platform_Versions", schema: "Platform");
        }
    }
}
