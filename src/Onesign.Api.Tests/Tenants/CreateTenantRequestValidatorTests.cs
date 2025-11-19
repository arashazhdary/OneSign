using FluentAssertions;
using FluentValidation.TestHelper;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Application.Validators;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class CreateTenantRequestValidatorTests
{
    private readonly CreateTenantRequestValidator _validator;

    public CreateTenantRequestValidatorTests()
    {
        _validator = new CreateTenantRequestValidator();
    }

    [Fact]
    public void Validate_ValidRequest_ShouldNotHaveErrors()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = "test-tenant"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyName_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "",
            Slug = "test-tenant"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Tenant name is required");
    }

    [Fact]
    public void Validate_NullName_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = null!,
            Slug = "test-tenant"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Tenant name is required");
    }

    [Fact]
    public void Validate_NameExceeds200Characters_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = new string('a', 201),
            Slug = "test-tenant"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Tenant name must not exceed 200 characters");
    }

    [Fact]
    public void Validate_NameExactly200Characters_ShouldNotHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = new string('a', 200),
            Slug = "test-tenant"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validate_EmptySlug_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = ""
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Slug)
            .WithErrorMessage("Tenant slug is required");
    }

    [Fact]
    public void Validate_NullSlug_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = null!
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Slug)
            .WithErrorMessage("Tenant slug is required");
    }

    [Fact]
    public void Validate_SlugWithUppercase_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = "Test-Tenant"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Slug)
            .WithErrorMessage("Slug must contain only lowercase letters, numbers, and hyphens");
    }

    [Fact]
    public void Validate_SlugWithSpaces_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = "test tenant"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Slug)
            .WithErrorMessage("Slug must contain only lowercase letters, numbers, and hyphens");
    }

    [Fact]
    public void Validate_SlugWithSpecialCharacters_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = "test_tenant!"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Slug)
            .WithErrorMessage("Slug must contain only lowercase letters, numbers, and hyphens");
    }

    [Fact]
    public void Validate_SlugExceeds100Characters_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = new string('a', 101)
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Slug)
            .WithErrorMessage("Slug must not exceed 100 characters");
    }

    [Fact]
    public void Validate_SlugExactly100Characters_ShouldNotHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = new string('a', 100)
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Slug);
    }

    [Theory]
    [InlineData("test-tenant")]
    [InlineData("my-company")]
    [InlineData("tenant123")]
    [InlineData("123")]
    [InlineData("a")]
    [InlineData("a-b-c")]
    [InlineData("company-2024")]
    public void Validate_ValidSlugFormats_ShouldNotHaveError(string slug)
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = slug
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Slug);
    }

    [Theory]
    [InlineData("Test-Tenant")]
    [InlineData("test_tenant")]
    [InlineData("test.tenant")]
    [InlineData("test@tenant")]
    [InlineData("test tenant")]
    [InlineData("test#tenant")]
    [InlineData("UPPERCASE")]
    public void Validate_InvalidSlugFormats_ShouldHaveError(string slug)
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = slug
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Slug);
    }

    [Fact]
    public void Validate_BothFieldsEmpty_ShouldHaveMultipleErrors()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "",
            Slug = ""
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name);
        result.ShouldHaveValidationErrorFor(x => x.Slug);
    }

    [Fact]
    public void Validate_NameWithSpecialCharacters_ShouldNotHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Acme Corp & Sons (2024) - LLC",
            Slug = "acme-corp"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validate_WhitespaceOnlyName_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "   ",
            Slug = "test-tenant"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("Tenant name is required");
    }

    [Fact]
    public void Validate_WhitespaceOnlySlug_ShouldHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = "   "
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Slug);
    }

    [Fact]
    public void Validate_SlugWithOnlyHyphens_ShouldNotHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = "---"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Slug);
    }

    [Fact]
    public void Validate_SlugWithLeadingHyphen_ShouldNotHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = "-test-tenant"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Slug);
    }

    [Fact]
    public void Validate_SlugWithTrailingHyphen_ShouldNotHaveError()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = "test-tenant-"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Slug);
    }

    [Fact]
    public void Validate_MultipleErrors_ReturnsAllErrors()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = new string('a', 201),
            Slug = "INVALID SLUG!"
        };

        // Act
        var result = _validator.TestValidate(request);

        // Assert
        result.Errors.Should().HaveCountGreaterOrEqualTo(2);
        result.ShouldHaveValidationErrorFor(x => x.Name);
        result.ShouldHaveValidationErrorFor(x => x.Slug);
    }

    [Fact]
    public void Validate_UsingValidateMethod_ReturnsCorrectResults()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "Test Tenant",
            Slug = "test-tenant"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Validate_InvalidRequest_UsingValidateMethod_ReturnsErrors()
    {
        // Arrange
        var request = new CreateTenantRequest
        {
            Name = "",
            Slug = "INVALID"
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().NotBeEmpty();
    }
}
