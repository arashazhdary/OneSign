using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onesign.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIsSandbox : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSandbox",
                table: "Tenants",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSandbox",
                table: "Tenants");
        }
    }
}
