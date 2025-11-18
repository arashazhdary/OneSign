using FluentAssertions;
using Onesign.Shared.Localization;
using Xunit;

namespace Onesign.Api.Tests.Shared;

public class LocalizationServiceTests
{
    private readonly LocalizationService _service;

    public LocalizationServiceTests()
    {
        _service = new LocalizationService();
    }

    [Fact]
    public void GetCultureFromHeader_WhenNull_ShouldReturnDefaultCulture()
    {
        // Act
        var culture = _service.GetCultureFromHeader(null);

        // Assert
        culture.Should().Be("en");
    }

    [Fact]
    public void GetCultureFromHeader_WhenEmpty_ShouldReturnDefaultCulture()
    {
        // Act
        var culture = _service.GetCultureFromHeader(string.Empty);

        // Assert
        culture.Should().Be("en");
    }

    [Fact]
    public void GetCultureFromHeader_WhenEnglish_ShouldReturnEnglish()
    {
        // Act
        var culture = _service.GetCultureFromHeader("en-US");

        // Assert
        culture.Should().Be("en");
    }

    [Fact]
    public void GetCultureFromHeader_WhenFarsi_ShouldReturnFarsi()
    {
        // Act
        var culture = _service.GetCultureFromHeader("fa-IR");

        // Assert
        culture.Should().Be("fa");
    }

    [Fact]
    public void GetCultureFromHeader_WhenPersian_ShouldReturnFarsi()
    {
        // Act
        var culture = _service.GetCultureFromHeader("persian");

        // Assert
        culture.Should().Be("fa");
    }

    [Fact]
    public void GetCultureFromHeader_WithMultipleLanguages_ShouldReturnFirstMatch()
    {
        // Act
        var culture = _service.GetCultureFromHeader("en-US,en;q=0.9,fa;q=0.8");

        // Assert
        culture.Should().Be("en");
    }

    [Fact]
    public void GetCultureFromHeader_WithFarsiFirst_ShouldReturnFarsi()
    {
        // Act
        var culture = _service.GetCultureFromHeader("fa-IR,en;q=0.9");

        // Assert
        culture.Should().Be("fa");
    }

    [Fact]
    public void GetCultureFromHeader_WithOnlyQualityWeights_ShouldParseLowercased()
    {
        // Act
        var culture = _service.GetCultureFromHeader("EN-US;q=1.0");

        // Assert
        culture.Should().Be("en");
    }

    [Fact]
    public void GetCultureFromHeader_WithFaPrefix_ShouldReturnFarsi()
    {
        // Act
        var culture = _service.GetCultureFromHeader("fa");

        // Assert
        culture.Should().Be("fa");
    }

    [Fact]
    public void GetCultureFromHeader_WithUnknownLanguage_ShouldReturnEnglish()
    {
        // Act
        var culture = _service.GetCultureFromHeader("de-DE");

        // Assert
        culture.Should().Be("en");
    }

    [Fact]
    public void GetCultureFromHeader_WithWhitespace_ShouldTrim()
    {
        // Act
        var culture = _service.GetCultureFromHeader("  fa-IR  ");

        // Assert
        culture.Should().Be("fa");
    }

    [Fact]
    public void GetString_WithNullCulture_ShouldUseDefaultCulture()
    {
        // Act
        var result = _service.GetString("SomeKey", null);

        // Assert - Will return the key if not found in resources
        result.Should().NotBeNull();
    }

    [Fact]
    public void GetString_WhenKeyNotFound_ShouldReturnKey()
    {
        // Arrange
        var key = "NonExistentKey";

        // Act
        var result = _service.GetString(key, "en");

        // Assert
        result.Should().Be(key);
    }

    [Fact]
    public void GetString_WithCulture_ShouldUseSpecifiedCulture()
    {
        // Act
        var result = _service.GetString("TestKey", "fa");

        // Assert
        result.Should().NotBeNull();
    }

    [Fact]
    public void GetString_WithArgsOverload_ShouldFormatString()
    {
        // Arrange
        var key = "FormatKey";

        // Act
        var result = _service.GetString(key, "arg1", "arg2");

        // Assert
        result.Should().NotBeNull();
    }

    [Fact]
    public void GetString_WithCultureAndArgs_ShouldFormatWithCulture()
    {
        // Arrange
        var key = "FormatKey";

        // Act
        var result = _service.GetString(key, "en", "value1", "value2");

        // Assert
        result.Should().NotBeNull();
    }

    [Fact]
    public void GetString_WithEmptyKey_ShouldReturnEmptyString()
    {
        // Act
        var result = _service.GetString(string.Empty);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public void GetString_WithFormatArguments_WhenKeyNotFound_ShouldAttemptFormat()
    {
        // Arrange
        var key = "Hello {0}";

        // Act
        var result = _service.GetString(key, "World");

        // Assert
        result.Should().Be("Hello World");
    }

    [Fact]
    public void GetString_WithMultipleFormatArguments_ShouldFormatAll()
    {
        // Arrange
        var key = "{0} {1} {2}";

        // Act
        var result = _service.GetString(key, "A", "B", "C");

        // Assert
        result.Should().Be("A B C");
    }

    [Fact]
    public void GetString_WithNumericFormatArguments_ShouldConvert()
    {
        // Arrange
        var key = "Number: {0}";

        // Act
        var result = _service.GetString(key, 42);

        // Assert
        result.Should().Be("Number: 42");
    }

    [Fact]
    public void GetCultureFromHeader_WithMixedCase_ShouldBeCaseInsensitive()
    {
        // Act
        var culture = _service.GetCultureFromHeader("FA-ir");

        // Assert
        culture.Should().Be("fa");
    }

    [Fact]
    public void GetCultureFromHeader_WithMultipleFarsiVariants_ShouldReturnFarsi()
    {
        // Test various Persian/Farsi identifiers
        var variants = new[] { "fa", "fa-IR", "fa-AF", "persian" };

        foreach (var variant in variants)
        {
            var culture = _service.GetCultureFromHeader(variant);
            culture.Should().Be("fa", because: $"variant '{variant}' should be recognized as Farsi");
        }
    }

    [Fact]
    public void GetCultureFromHeader_WithComplexAcceptLanguage_ShouldParseCorrectly()
    {
        // Act
        var culture = _service.GetCultureFromHeader("zh-CN,zh;q=0.9,en;q=0.8,fa;q=0.7");

        // Assert - fa is in the list but en is before it, and default is en
        culture.Should().Be("en");
    }

    [Fact]
    public void GetCultureFromHeader_FarsiInMiddle_ShouldDetect()
    {
        // Act
        var culture = _service.GetCultureFromHeader("fr,fa,en");

        // Assert
        culture.Should().Be("fa");
    }

    [Fact]
    public void GetString_MultipleCalls_ShouldBehaveConsistently()
    {
        // Arrange
        var key = "TestKey";

        // Act
        var result1 = _service.GetString(key);
        var result2 = _service.GetString(key);
        var result3 = _service.GetString(key);

        // Assert
        result1.Should().Be(result2);
        result2.Should().Be(result3);
    }

    [Fact]
    public void GetString_WithInvalidFormatString_ShouldHandle()
    {
        // Arrange
        var key = "Invalid {0} {1}";

        // Act - Only providing one argument for two placeholders
        Action act = () => _service.GetString(key, "value");

        // Assert - Should throw FormatException
        act.Should().Throw<FormatException>();
    }

    [Fact]
    public void GetString_WithNoArgs_ShouldReturnUnformatted()
    {
        // Arrange
        var key = "KeyWithNoPlaceholders";

        // Act
        var result = _service.GetString(key);

        // Assert
        result.Should().Be(key);
    }

    [Fact]
    public void LocalizationService_ShouldImplementInterface()
    {
        // Assert
        _service.Should().BeAssignableTo<ILocalizationService>();
    }

    [Fact]
    public void Constructor_ShouldInitializeSuccessfully()
    {
        // Act
        var service = new LocalizationService();

        // Assert
        service.Should().NotBeNull();
    }
}
