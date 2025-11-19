using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Copilot.Application.Commands;
using Onesign.Modules.Copilot.Application.Queries;
using Onesign.Modules.Copilot.Domain.Entities;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Modules.Copilot.Domain.Repositories;

namespace Onesign.Api.Tests.Copilot;

#region ProcessCopilotQueryCommand Tests

public class ProcessCopilotQueryCommandTests
{
    [Fact]
    public void ProcessCopilotQueryCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ProcessCopilotQueryCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ConversationId = Guid.NewGuid(),
            Query = "Show me users with high risk scores",
            Context = new Dictionary<string, string>
            {
                { "currentPage", "users" },
                { "filters", "status=active" }
            }
        };

        // Assert
        command.Query.Should().Be("Show me users with high risk scores");
        command.Context.Should().ContainKey("currentPage");
    }
}

#endregion

#region CreateConversationCommand Tests

public class CreateConversationCommandTests
{
    [Fact]
    public void CreateConversationCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateConversationCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Title = "Security Analysis",
            InitialQuery = "Analyze recent security events"
        };

        // Assert
        command.Title.Should().Be("Security Analysis");
        command.InitialQuery.Should().NotBeEmpty();
    }
}

#endregion

#region ProvideFeedbackCommand Tests

public class ProvideFeedbackCommandTests
{
    [Fact]
    public void ProvideFeedbackCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ProvideFeedbackCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ResponseId = Guid.NewGuid(),
            Rating = 5,
            Comments = "Very helpful response",
            WasHelpful = true
        };

        // Assert
        command.Rating.Should().Be(5);
        command.WasHelpful.Should().BeTrue();
    }
}

#endregion

#region ExecuteSuggestedActionCommand Tests

public class ExecuteSuggestedActionCommandTests
{
    [Fact]
    public void ExecuteSuggestedActionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ExecuteSuggestedActionCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ResponseId = Guid.NewGuid(),
            ActionId = Guid.NewGuid(),
            Parameters = new Dictionary<string, string>
            {
                { "userId", Guid.NewGuid().ToString() },
                { "newStatus", "disabled" }
            }
        };

        // Assert
        command.ActionId.Should().NotBeEmpty();
        command.Parameters.Should().ContainKey("userId");
    }
}

#endregion

#region GetConversationHistoryQuery Tests

public class GetConversationHistoryQueryTests
{
    [Fact]
    public void GetConversationHistoryQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetConversationHistoryQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            ConversationId = Guid.NewGuid(),
            PageNumber = 1,
            PageSize = 50
        };

        // Assert
        query.ConversationId.Should().NotBeEmpty();
        query.PageSize.Should().Be(50);
    }
}

#endregion

#region GetUserConversationsQuery Tests

public class GetUserConversationsQueryTests
{
    [Fact]
    public void GetUserConversationsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetUserConversationsQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.UserId.Should().NotBeEmpty();
    }
}

#endregion

#region GetInsightSuggestionsQuery Tests

public class GetInsightSuggestionsQueryTests
{
    [Fact]
    public void GetInsightSuggestionsQuery_ShouldHaveContext()
    {
        // Arrange & Act
        var query = new GetInsightSuggestionsQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Context = "dashboard",
            MaxSuggestions = 5
        };

        // Assert
        query.Context.Should().Be("dashboard");
        query.MaxSuggestions.Should().Be(5);
    }
}

#endregion

#region GetRecentQueriesQuery Tests

public class GetRecentQueriesQueryTests
{
    [Fact]
    public void GetRecentQueriesQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetRecentQueriesQuery
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Limit = 10
        };

        // Assert
        query.Limit.Should().Be(10);
    }
}

#endregion

#region Conversation Entity Tests

public class ConversationEntityTests
{
    [Fact]
    public void Conversation_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var conversation = new Conversation(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Conversation");

        // Assert
        conversation.Title.Should().Be("Test Conversation");
        conversation.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Conversation_AddMessage_ShouldAddUserMessage()
    {
        // Arrange
        var conversation = new Conversation(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test");

        // Act
        conversation.AddUserMessage("Hello");

        // Assert
        conversation.Messages.Should().HaveCount(1);
        conversation.Messages.First().Role.Should().Be(MessageRole.User);
    }

    [Fact]
    public void Conversation_AddAssistantMessage_ShouldAddAssistantMessage()
    {
        // Arrange
        var conversation = new Conversation(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test");

        // Act
        conversation.AddAssistantMessage("Hi, how can I help?");

        // Assert
        conversation.Messages.Should().HaveCount(1);
        conversation.Messages.First().Role.Should().Be(MessageRole.Assistant);
    }

    [Fact]
    public void Conversation_Close_ShouldSetIsActiveToFalse()
    {
        // Arrange
        var conversation = new Conversation(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test");

        // Act
        conversation.Close();

        // Assert
        conversation.IsActive.Should().BeFalse();
    }
}

#endregion

#region CopilotResponse Entity Tests

public class CopilotResponseEntityTests
{
    [Fact]
    public void CopilotResponse_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var response = new CopilotResponse(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Your query results",
            ResponseType.Text);

        // Assert
        response.Content.Should().Be("Your query results");
        response.Type.Should().Be(ResponseType.Text);
    }

    [Fact]
    public void CopilotResponse_AddSuggestedAction_ShouldAddAction()
    {
        // Arrange
        var response = new CopilotResponse(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Content",
            ResponseType.Text);

        // Act
        response.AddSuggestedAction("Disable User", "DisableUser", new Dictionary<string, string>());

        // Assert
        response.SuggestedActions.Should().HaveCount(1);
    }

    [Fact]
    public void CopilotResponse_RecordFeedback_ShouldUpdateFeedback()
    {
        // Arrange
        var response = new CopilotResponse(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Content",
            ResponseType.Text);

        // Act
        response.RecordFeedback(5, true, "Great!");

        // Assert
        response.Rating.Should().Be(5);
        response.WasHelpful.Should().BeTrue();
    }
}

#endregion

#region CopilotQuery Entity Tests

public class CopilotQueryEntityTests
{
    [Fact]
    public void CopilotQuery_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var query = new CopilotQuery(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Show recent incidents");

        // Assert
        query.QueryText.Should().Be("Show recent incidents");
        query.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void CopilotQuery_Complete_ShouldSetCompletedAt()
    {
        // Arrange
        var query = new CopilotQuery(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Query");

        // Act
        query.Complete(100);

        // Assert
        query.CompletedAt.Should().NotBeNull();
        query.ProcessingTimeMs.Should().Be(100);
    }
}

#endregion

#region ResponseType Enum Tests

public class ResponseTypeEnumTests
{
    [Theory]
    [InlineData(ResponseType.Text)]
    [InlineData(ResponseType.Table)]
    [InlineData(ResponseType.Chart)]
    [InlineData(ResponseType.Action)]
    [InlineData(ResponseType.Mixed)]
    public void ResponseType_ShouldHaveCorrectValues(ResponseType type)
    {
        // Assert
        type.Should().BeDefined();
    }
}

#endregion

#region MessageRole Enum Tests

public class MessageRoleEnumTests
{
    [Theory]
    [InlineData(MessageRole.User)]
    [InlineData(MessageRole.Assistant)]
    [InlineData(MessageRole.System)]
    public void MessageRole_ShouldHaveCorrectValues(MessageRole role)
    {
        // Assert
        role.Should().BeDefined();
    }
}

#endregion
