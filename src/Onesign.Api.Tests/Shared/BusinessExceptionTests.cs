using FluentAssertions;
using Onesign.Shared.Exceptions;
using Xunit;

namespace Onesign.Api.Tests.Shared;

public class BusinessExceptionTests
{
    [Fact]
    public void BusinessException_WithErrorCodeAndMessage_ShouldSetProperties()
    {
        // Arrange
        var errorCode = "ERR001";
        var message = "Business rule violated";

        // Act
        var exception = new BusinessException(errorCode, message);

        // Assert
        exception.ErrorCode.Should().Be(errorCode);
        exception.Message.Should().Be(message);
    }

    [Fact]
    public void BusinessException_ShouldInheritFromException()
    {
        // Arrange
        var exception = new BusinessException("ERR", "Test");

        // Assert
        exception.Should().BeAssignableTo<Exception>();
    }

    [Fact]
    public void BusinessException_WithInnerException_ShouldSetAllProperties()
    {
        // Arrange
        var errorCode = "ERR002";
        var message = "Outer exception message";
        var innerException = new InvalidOperationException("Inner exception");

        // Act
        var exception = new BusinessException(errorCode, message, innerException);

        // Assert
        exception.ErrorCode.Should().Be(errorCode);
        exception.Message.Should().Be(message);
        exception.InnerException.Should().Be(innerException);
        exception.InnerException!.Message.Should().Be("Inner exception");
    }

    [Fact]
    public void BusinessException_CanBeThrownAndCaught()
    {
        // Arrange
        var errorCode = "VALIDATION_ERROR";
        var message = "Input validation failed";

        // Act & Assert
        var exception = Assert.Throws<BusinessException>(() =>
        {
            throw new BusinessException(errorCode, message);
        });

        exception.ErrorCode.Should().Be(errorCode);
        exception.Message.Should().Be(message);
    }

    [Fact]
    public void BusinessException_WithEmptyErrorCode_ShouldAllowEmptyString()
    {
        // Arrange & Act
        var exception = new BusinessException(string.Empty, "Message");

        // Assert
        exception.ErrorCode.Should().BeEmpty();
    }

    [Fact]
    public void BusinessException_WithEmptyMessage_ShouldAllowEmptyString()
    {
        // Arrange & Act
        var exception = new BusinessException("CODE", string.Empty);

        // Assert
        exception.Message.Should().BeEmpty();
    }

    [Fact]
    public void BusinessException_WithNestedInnerExceptions_ShouldPreserveChain()
    {
        // Arrange
        var innermost = new ArgumentException("Innermost");
        var middle = new InvalidOperationException("Middle", innermost);
        var outer = new BusinessException("ERR003", "Outer", middle);

        // Assert
        outer.InnerException.Should().Be(middle);
        outer.InnerException!.InnerException.Should().Be(innermost);
    }

    [Fact]
    public void BusinessException_ErrorCode_ShouldBeDifferentFromMessage()
    {
        // Arrange
        var exception = new BusinessException("CODE123", "This is the message");

        // Assert
        exception.ErrorCode.Should().NotBe(exception.Message);
    }

    [Fact]
    public void BusinessException_MultipleInstances_ShouldBeIndependent()
    {
        // Arrange & Act
        var exception1 = new BusinessException("ERR001", "First error");
        var exception2 = new BusinessException("ERR002", "Second error");

        // Assert
        exception1.ErrorCode.Should().NotBe(exception2.ErrorCode);
        exception1.Message.Should().NotBe(exception2.Message);
    }

    [Fact]
    public void BusinessException_WithSpecialCharactersInErrorCode_ShouldHandle()
    {
        // Arrange
        var errorCode = "ERR-001_TEST.CODE";
        var message = "Special characters in code";

        // Act
        var exception = new BusinessException(errorCode, message);

        // Assert
        exception.ErrorCode.Should().Be(errorCode);
    }

    [Fact]
    public void BusinessException_WithUnicodeInMessage_ShouldHandle()
    {
        // Arrange
        var errorCode = "UNICODE_ERR";
        var message = "Error with unicode: \u00e9\u00e8\u00ea \u4e2d\u6587";

        // Act
        var exception = new BusinessException(errorCode, message);

        // Assert
        exception.Message.Should().Be(message);
    }

    [Fact]
    public void BusinessException_StackTrace_ShouldBeAvailable()
    {
        // Arrange
        BusinessException? caughtException = null;

        // Act
        try
        {
            throw new BusinessException("ERR", "Test");
        }
        catch (BusinessException ex)
        {
            caughtException = ex;
        }

        // Assert
        caughtException.Should().NotBeNull();
        caughtException!.StackTrace.Should().NotBeNullOrEmpty();
    }
}
