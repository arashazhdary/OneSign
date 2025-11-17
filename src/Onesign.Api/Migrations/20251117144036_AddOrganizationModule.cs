using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onesign.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create OrgUnits table
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
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationOrgUnits_ApplicationClientId",
                table: "ApplicationOrgUnits",
                column: "ApplicationClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationOrgUnits_OrgUnitId",
                table: "ApplicationOrgUnits",
                column: "OrgUnitId");

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
                columns: new[] { "TenantUserId", "OrgUnitId" });

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
                columns: new[] { "TenantId", "Path" });

            migrationBuilder.CreateIndex(
                name: "IX_UserOrgUnits_OrgUnitId",
                table: "UserOrgUnits",
                column: "OrgUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOrgUnits_TenantUserId",
                table: "UserOrgUnits",
                column: "TenantUserId");

            // Backfill: Create root OrgUnit for each existing tenant and assign users/apps
            migrationBuilder.Sql(@"
                -- Create root OrgUnit for each tenant
                INSERT INTO OrgUnits (Id, TenantId, ParentId, Name, Code, Path, Level, SortOrder, Status, CreatedAt, UpdatedAt)
                SELECT 
                    NEWID() as Id,
                    Id as TenantId,
                    NULL as ParentId,
                    Name + ' Root' as Name,
                    NULL as Code,
                    '000' as Path,
                    0 as Level,
                    1 as SortOrder,
                    1 as Status,
                    GETUTCDATE() as CreatedAt,
                    NULL as UpdatedAt
                FROM Tenants
                WHERE NOT EXISTS (
                    SELECT 1 FROM OrgUnits WHERE OrgUnits.TenantId = Tenants.Id AND OrgUnits.ParentId IS NULL
                );

                -- Assign all existing TenantUsers to root OrgUnit
                INSERT INTO UserOrgUnits (TenantUserId, OrgUnitId, IsPrimary)
                SELECT 
                    tu.Id as TenantUserId,
                    ou.Id as OrgUnitId,
                    1 as IsPrimary
                FROM TenantUsers tu
                INNER JOIN OrgUnits ou ON ou.TenantId = tu.TenantId AND ou.ParentId IS NULL
                WHERE NOT EXISTS (
                    SELECT 1 FROM UserOrgUnits uou WHERE uou.TenantUserId = tu.Id AND uou.IsPrimary = 1
                );

                -- Assign all existing ApplicationClients to root OrgUnit
                INSERT INTO ApplicationOrgUnits (ApplicationClientId, OrgUnitId)
                SELECT 
                    ac.Id as ApplicationClientId,
                    ou.Id as OrgUnitId
                FROM ApplicationClients ac
                INNER JOIN OrgUnits ou ON ou.TenantId = ac.TenantId AND ou.ParentId IS NULL
                WHERE NOT EXISTS (
                    SELECT 1 FROM ApplicationOrgUnits aou WHERE aou.ApplicationClientId = ac.Id
                );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationOrgUnits");

            migrationBuilder.DropTable(
                name: "AuthorizationCodes");

            migrationBuilder.DropTable(
                name: "DelegatedAdminScopes");

            migrationBuilder.DropTable(
                name: "OrgUnits");

            migrationBuilder.DropTable(
                name: "UserOrgUnits");
        }
    }
}
