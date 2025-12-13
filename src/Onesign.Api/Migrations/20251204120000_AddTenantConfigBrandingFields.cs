using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onesign.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantConfigBrandingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LogoDarkUrl",
                table: "TenantConfigs",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FaviconUrl",
                table: "TenantConfigs",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryColor",
                table: "TenantConfigs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccentColor",
                table: "TenantConfigs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenantName",
                table: "TenantConfigs",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WelcomeTitle",
                table: "TenantConfigs",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WelcomeSubtitle",
                table: "TenantConfigs",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FooterText",
                table: "TenantConfigs",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LoginPageConfigJson",
                table: "TenantConfigs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FeaturesJson",
                table: "TenantConfigs",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LogoDarkUrl",
                table: "TenantConfigs");

            migrationBuilder.DropColumn(
                name: "FaviconUrl",
                table: "TenantConfigs");

            migrationBuilder.DropColumn(
                name: "SecondaryColor",
                table: "TenantConfigs");

            migrationBuilder.DropColumn(
                name: "AccentColor",
                table: "TenantConfigs");

            migrationBuilder.DropColumn(
                name: "TenantName",
                table: "TenantConfigs");

            migrationBuilder.DropColumn(
                name: "WelcomeTitle",
                table: "TenantConfigs");

            migrationBuilder.DropColumn(
                name: "WelcomeSubtitle",
                table: "TenantConfigs");

            migrationBuilder.DropColumn(
                name: "FooterText",
                table: "TenantConfigs");

            migrationBuilder.DropColumn(
                name: "LoginPageConfigJson",
                table: "TenantConfigs");

            migrationBuilder.DropColumn(
                name: "FeaturesJson",
                table: "TenantConfigs");
        }
    }
}
