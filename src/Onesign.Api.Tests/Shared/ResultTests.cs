using FluentAssertions;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Shared;

public class ResultTests
{
    [Fact]
    public void Success_ShouldReturnSuccessfulResult()
    {
        // Act
        var result = Result.Success();

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.IsFailure.Should().BeFalse();
        result.ErrorCode.Should().BeNull();
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void Failure_WithErrorCode_ShouldReturnFailedResult()
    {
        // Arrange
        var errorCode = "ERR001";

        // Act
        var result = Result.Failure(errorCode);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be(errorCode);
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void Failure_WithErrorCodeAndMessage_ShouldReturnFailedResultWithMessage()
    {
        // Arrange
        var errorCode = "ERR002";
        var errorMessage = "Something went wrong";

        // Act
        var result = Result.Failure(errorCode, errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be(errorCode);
        result.ErrorMessage.Should().Be(errorMessage);
    }

    [Fact]
    public void SuccessGeneric_ShouldReturnSuccessfulResultWithValue()
    {
        // Arrange
        var value = "test value";

        // Act
        var result = Result.Success(value);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.IsFailure.Should().BeFalse();
        result.Value.Should().Be(value);
        result.ErrorCode.Should().BeNull();
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void SuccessGeneric_WithIntValue_ShouldReturnCorrectValue()
    {
        // Arrange
        var value = 42;

        // Act
        var result = Result.Success(value);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(value);
    }

    [Fact]
    public void SuccessGeneric_WithComplexObject_ShouldReturnCorrectValue()
    {
        // Arrange
        var value = new TestObject { Id = 1, Name = "Test" };

        // Act
        var result = Result.Success(value);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Id.Should().Be(1);
        result.Value.Name.Should().Be("Test");
    }

    [Fact]
    public void FailureGeneric_ShouldReturnFailedResultWithNullValue()
    {
        // Arrange
        var errorCode = "ERR003";

        // Act
        var result = Result.Failure<string>(errorCode);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Value.Should().BeNull();
        result.ErrorCode.Should().Be(errorCode);
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void FailureGeneric_WithErrorCodeAndMessage_ShouldReturnFailedResult()
    {
        // Arrange
        var errorCode = "ERR004";
        var errorMessage = "Failed to process";

        // Act
        var result = Result.Failure<int>(errorCode, errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.IsFailure.Should().BeTrue();
        result.Value.Should().Be(default);
        result.ErrorCode.Should().Be(errorCode);
        result.ErrorMessage.Should().Be(errorMessage);
    }

    [Fact]
    public void FailureGeneric_WithComplexType_ShouldReturnDefaultValue()
    {
        // Arrange
        var errorCode = "ERR005";
        var errorMessage = "Complex type failure";

        // Act
        var result = Result.Failure<TestObject>(errorCode, errorMessage);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Value.Should().BeNull();
        result.ErrorCode.Should().Be(errorCode);
        result.ErrorMessage.Should().Be(errorMessage);
    }

    [Fact]
    public void SuccessGeneric_WithNullValue_ShouldReturnSuccessWithNullValue()
    {
        // Act
        var result = Result.Success<string?>(null);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeNull();
    }

    [Fact]
    public void SuccessGeneric_WithGuid_ShouldReturnCorrectValue()
    {
        // Arrange
        var value = Guid.NewGuid();

        // Act
        var result = Result.Success(value);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(value);
    }

    [Fact]
    public void SuccessGeneric_WithList_ShouldReturnCorrectValue()
    {
        // Arrange
        var value = new List<int> { 1, 2, 3 };

        // Act
        var result = Result.Success(value);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEquivalentTo(new[] { 1, 2, 3 });
    }

    [Fact]
    public void FailureGeneric_WithValueType_ShouldReturnDefaultValue()
    {
        // Act
        var result = Result.Failure<bool>("ERR006", "Boolean failure");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Value.Should().BeFalse();
    }

    [Fact]
    public void IsFailure_ShouldBeInverseOfIsSuccess()
    {
        // Arrange
        var successResult = Result.Success();
        var failureResult = Result.Failure("ERR", "Error");

        // Assert
        successResult.IsFailure.Should().Be(!successResult.IsSuccess);
        failureResult.IsFailure.Should().Be(!failureResult.IsSuccess);
    }

    [Fact]
    public void GenericResult_InheritsFromResult_ShouldHaveCorrectBehavior()
    {
        // Arrange
        var genericResult = Result.Success("value");

        // Act & Assert
        genericResult.Should().BeAssignableTo<Result>();
    }

    private class TestObject
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
