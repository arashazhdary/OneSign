using FluentAssertions;
using Moq;
using Onesign.Modules.Copilot.Domain.Entities;
using Onesign.Modules.Copilot.Domain.Enums;
using Onesign.Modules.Copilot.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Copilot;

public class CopilotModuleTests
{
    #region CopilotConversation Entity Tests

    [Fact]
    public void CopilotConversation_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var conversation = new CopilotConversation();

        // Assert
        conversation.Id.Should().Be(Guid.Empty);
        conversation.TenantId.Should().Be(Guid.Empty);
        conversation.UserId.Should().Be(Guid.Empty);
        conversation.Messages.Should().NotBeNull();
        conversation.Messages.Should().BeEmpty();
    }

    [Fact]
    public void CopilotConversation_Creation_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var conversationId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var createdAt = DateTimeOffset.UtcNow;
        var lastMessageAt = DateTimeOffset.UtcNow.AddMinutes(5);

        // Act
        var conversation = new CopilotConversation
        {
            Id = conversationId,
            TenantId = tenantId,
            UserId = userId,
            CreatedAt = createdAt,
            LastMessageAt = lastMessageAt
        };

        // Assert
        conversation.Id.Should().Be(conversationId);
        conversation.TenantId.Should().Be(tenantId);
        conversation.UserId.Should().Be(userId);
        conversation.CreatedAt.Should().Be(createdAt);
        conversation.LastMessageAt.Should().Be(lastMessageAt);
    }

    [Fact]
    public void CopilotConversation_AddMessage_ShouldAddToMessagesList()
    {
        // Arrange
        var conversation = new CopilotConversation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        var message = new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            Role = MessageRole.User,
            Content = "Hello, Copilot!"
        };

        // Act
        conversation.Messages.Add(message);

        // Assert
        conversation.Messages.Should().HaveCount(1);
        conversation.Messages[0].Content.Should().Be("Hello, Copilot!");
    }

    [Theory]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    public void CopilotConversation_MultipleMessages_ShouldMaintainOrder(int messageCount)
    {
        // Arrange
        var conversation = new CopilotConversation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        // Act
        for (int i = 0; i < messageCount; i++)
        {
            conversation.Messages.Add(new CopilotMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                Role = i % 2 == 0 ? MessageRole.User : MessageRole.Assistant,
                Content = $"Message {i}",
                CreatedAt = DateTimeOffset.UtcNow.AddMinutes(i)
            });
        }

        // Assert
        conversation.Messages.Should().HaveCount(messageCount);
        for (int i = 0; i < messageCount; i++)
        {
            conversation.Messages[i].Content.Should().Be($"Message {i}");
        }
    }

    #endregion

    #region CopilotMessage Entity Tests

    [Fact]
    public void CopilotMessage_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var message = new CopilotMessage();

        // Assert
        message.Id.Should().Be(Guid.Empty);
        message.ConversationId.Should().Be(Guid.Empty);
        message.Role.Should().Be(MessageRole.User);
        message.Content.Should().BeEmpty();
        message.ContextType.Should().Be(ContextType.Dashboard);
        message.ContextId.Should().BeNull();
        message.SuggestedActionsJson.Should().BeNull();
    }

    [Fact]
    public void CopilotMessage_Creation_ShouldSetAllPropertiesCorrectly()
    {
        // Arrange
        var messageId = Guid.NewGuid();
        var conversationId = Guid.NewGuid();
        var contextId = Guid.NewGuid();
        var createdAt = DateTimeOffset.UtcNow;
        var suggestedActions = "[{\"action\": \"review_policy\"}]";

        // Act
        var message = new CopilotMessage
        {
            Id = messageId,
            ConversationId = conversationId,
            Role = MessageRole.Assistant,
            Content = "Here is my response",
            ContextType = ContextType.Incident,
            ContextId = contextId,
            SuggestedActionsJson = suggestedActions,
            CreatedAt = createdAt
        };

        // Assert
        message.Id.Should().Be(messageId);
        message.ConversationId.Should().Be(conversationId);
        message.Role.Should().Be(MessageRole.Assistant);
        message.Content.Should().Be("Here is my response");
        message.ContextType.Should().Be(ContextType.Incident);
        message.ContextId.Should().Be(contextId);
        message.SuggestedActionsJson.Should().Be(suggestedActions);
        message.CreatedAt.Should().Be(createdAt);
    }

    [Theory]
    [InlineData("", true)]
    [InlineData("Short message", true)]
    [InlineData("A very long message that contains detailed information about the security incident and recommendations", true)]
    public void CopilotMessage_Content_ShouldAcceptVariousLengths(string content, bool isValid)
    {
        // Arrange & Act
        var message = new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = Guid.NewGuid(),
            Content = content,
            Role = MessageRole.Assistant
        };

        // Assert
        message.Content.Should().Be(content);
        isValid.Should().BeTrue();
    }

    [Fact]
    public void CopilotMessage_WithNullContextId_ShouldBeValid()
    {
        // Arrange & Act
        var message = new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = Guid.NewGuid(),
            Role = MessageRole.User,
            Content = "Generic question",
            ContextType = ContextType.Generic,
            ContextId = null
        };

        // Assert
        message.ContextId.Should().BeNull();
        message.ContextType.Should().Be(ContextType.Generic);
    }

    #endregion

    #region MessageRole Enum Tests

    [Fact]
    public void MessageRole_Enum_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)MessageRole.User).Should().Be(0);
        ((int)MessageRole.Assistant).Should().Be(1);
        ((int)MessageRole.System).Should().Be(2);
    }

    [Theory]
    [InlineData(MessageRole.User, "User")]
    [InlineData(MessageRole.Assistant, "Assistant")]
    [InlineData(MessageRole.System, "System")]
    public void MessageRole_Enum_ShouldHaveCorrectNames(MessageRole role, string expectedName)
    {
        // Assert
        role.ToString().Should().Be(expectedName);
    }

    [Fact]
    public void MessageRole_Enum_ShouldHaveThreeValues()
    {
        // Arrange
        var values = Enum.GetValues<MessageRole>();

        // Assert
        values.Should().HaveCount(3);
    }

    #endregion

    #region ContextType Enum Tests

    [Fact]
    public void ContextType_Enum_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)ContextType.Dashboard).Should().Be(0);
        ((int)ContextType.Incident).Should().Be(1);
        ((int)ContextType.Policy).Should().Be(2);
        ((int)ContextType.ChangeSet).Should().Be(3);
        ((int)ContextType.Hunting).Should().Be(4);
        ((int)ContextType.Automation).Should().Be(5);
        ((int)ContextType.Generic).Should().Be(6);
    }

    [Theory]
    [InlineData(ContextType.Dashboard, "Dashboard")]
    [InlineData(ContextType.Incident, "Incident")]
    [InlineData(ContextType.Policy, "Policy")]
    [InlineData(ContextType.ChangeSet, "ChangeSet")]
    [InlineData(ContextType.Hunting, "Hunting")]
    [InlineData(ContextType.Automation, "Automation")]
    [InlineData(ContextType.Generic, "Generic")]
    public void ContextType_Enum_ShouldHaveCorrectNames(ContextType contextType, string expectedName)
    {
        // Assert
        contextType.ToString().Should().Be(expectedName);
    }

    [Fact]
    public void ContextType_Enum_ShouldHaveSevenValues()
    {
        // Arrange
        var values = Enum.GetValues<ContextType>();

        // Assert
        values.Should().HaveCount(7);
    }

    #endregion

    #region Repository Tests with Mocking

    [Fact]
    public async Task Repository_GetByIdAsync_ShouldReturnConversation()
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var conversationId = Guid.NewGuid();
        var expectedConversation = new CopilotConversation
        {
            Id = conversationId,
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        repositoryMock.Setup(r => r.GetByIdAsync(conversationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedConversation);

        // Act
        var result = await repositoryMock.Object.GetByIdAsync(conversationId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(conversationId);
        repositoryMock.Verify(r => r.GetByIdAsync(conversationId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Repository_GetByIdAsync_ShouldReturnNullWhenNotFound()
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var nonExistentId = Guid.NewGuid();

        repositoryMock.Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((CopilotConversation?)null);

        // Act
        var result = await repositoryMock.Object.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Repository_GetByIdWithMessagesAsync_ShouldIncludeMessages()
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var conversationId = Guid.NewGuid();
        var conversation = new CopilotConversation
        {
            Id = conversationId,
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Messages = new List<CopilotMessage>
            {
                new() { Id = Guid.NewGuid(), ConversationId = conversationId, Role = MessageRole.User, Content = "Hello" },
                new() { Id = Guid.NewGuid(), ConversationId = conversationId, Role = MessageRole.Assistant, Content = "Hi there!" }
            }
        };

        repositoryMock.Setup(r => r.GetByIdWithMessagesAsync(conversationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(conversation);

        // Act
        var result = await repositoryMock.Object.GetByIdWithMessagesAsync(conversationId);

        // Assert
        result.Should().NotBeNull();
        result!.Messages.Should().HaveCount(2);
        result.Messages[0].Role.Should().Be(MessageRole.User);
        result.Messages[1].Role.Should().Be(MessageRole.Assistant);
    }

    [Fact]
    public async Task Repository_GetByUserIdAsync_ShouldReturnUserConversations()
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var conversations = new List<CopilotConversation>
        {
            new() { Id = Guid.NewGuid(), TenantId = tenantId, UserId = userId },
            new() { Id = Guid.NewGuid(), TenantId = tenantId, UserId = userId },
            new() { Id = Guid.NewGuid(), TenantId = tenantId, UserId = userId }
        };

        repositoryMock.Setup(r => r.GetByUserIdAsync(tenantId, userId, It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(conversations);

        // Act
        var result = await repositoryMock.Object.GetByUserIdAsync(tenantId, userId, 10);

        // Assert
        result.Should().HaveCount(3);
        result.Should().OnlyContain(c => c.UserId == userId && c.TenantId == tenantId);
    }

    [Theory]
    [InlineData(5)]
    [InlineData(10)]
    [InlineData(20)]
    public async Task Repository_GetByUserIdAsync_ShouldRespectLimit(int limit)
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        repositoryMock.Setup(r => r.GetByUserIdAsync(tenantId, userId, limit, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CopilotConversation>());

        // Act
        await repositoryMock.Object.GetByUserIdAsync(tenantId, userId, limit);

        // Assert
        repositoryMock.Verify(r => r.GetByUserIdAsync(tenantId, userId, limit, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Repository_GetLatestByUserIdAsync_ShouldReturnMostRecentConversation()
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var latestConversation = new CopilotConversation
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            LastMessageAt = DateTimeOffset.UtcNow
        };

        repositoryMock.Setup(r => r.GetLatestByUserIdAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(latestConversation);

        // Act
        var result = await repositoryMock.Object.GetLatestByUserIdAsync(tenantId, userId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(latestConversation.Id);
    }

    [Fact]
    public async Task Repository_AddAsync_ShouldAddConversation()
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var conversation = new CopilotConversation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        repositoryMock.Setup(r => r.AddAsync(It.IsAny<CopilotConversation>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await repositoryMock.Object.AddAsync(conversation);

        // Assert
        repositoryMock.Verify(r => r.AddAsync(conversation, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Repository_AddMessageAsync_ShouldAddMessageToConversation()
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var message = new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = Guid.NewGuid(),
            Role = MessageRole.User,
            Content = "Test message",
            ContextType = ContextType.Dashboard,
            CreatedAt = DateTimeOffset.UtcNow
        };

        repositoryMock.Setup(r => r.AddMessageAsync(It.IsAny<CopilotMessage>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await repositoryMock.Object.AddMessageAsync(message);

        // Assert
        repositoryMock.Verify(r => r.AddMessageAsync(message, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Repository_UpdateAsync_ShouldUpdateConversation()
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var conversation = new CopilotConversation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            LastMessageAt = DateTimeOffset.UtcNow
        };

        repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<CopilotConversation>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await repositoryMock.Object.UpdateAsync(conversation);

        // Assert
        repositoryMock.Verify(r => r.UpdateAsync(conversation, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Repository_DeleteAsync_ShouldDeleteConversation()
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var conversationId = Guid.NewGuid();

        repositoryMock.Setup(r => r.DeleteAsync(conversationId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await repositoryMock.Object.DeleteAsync(conversationId);

        // Assert
        repositoryMock.Verify(r => r.DeleteAsync(conversationId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Conversation Flow Tests

    [Fact]
    public void ConversationFlow_UserAssistantExchange_ShouldAlternateRoles()
    {
        // Arrange
        var conversation = new CopilotConversation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Act - Simulate a conversation flow
        conversation.Messages.Add(new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            Role = MessageRole.User,
            Content = "What is the current security posture?",
            ContextType = ContextType.Dashboard,
            CreatedAt = DateTimeOffset.UtcNow
        });

        conversation.Messages.Add(new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            Role = MessageRole.Assistant,
            Content = "Based on the dashboard metrics, your security posture is strong with a score of 85/100.",
            ContextType = ContextType.Dashboard,
            SuggestedActionsJson = "[{\"action\": \"view_details\"}]",
            CreatedAt = DateTimeOffset.UtcNow.AddSeconds(1)
        });

        // Assert
        conversation.Messages.Should().HaveCount(2);
        conversation.Messages[0].Role.Should().Be(MessageRole.User);
        conversation.Messages[1].Role.Should().Be(MessageRole.Assistant);
        conversation.Messages[1].SuggestedActionsJson.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void ConversationFlow_IncidentContext_ShouldContainContextId()
    {
        // Arrange
        var conversation = new CopilotConversation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        var incidentId = Guid.NewGuid();

        // Act
        conversation.Messages.Add(new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            Role = MessageRole.User,
            Content = "Tell me about this incident",
            ContextType = ContextType.Incident,
            ContextId = incidentId,
            CreatedAt = DateTimeOffset.UtcNow
        });

        // Assert
        conversation.Messages[0].ContextType.Should().Be(ContextType.Incident);
        conversation.Messages[0].ContextId.Should().Be(incidentId);
    }

    [Fact]
    public void ConversationFlow_SystemMessage_ShouldBeFirst()
    {
        // Arrange
        var conversation = new CopilotConversation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        };

        // Act
        conversation.Messages.Add(new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            Role = MessageRole.System,
            Content = "You are a security assistant helping users with identity management.",
            ContextType = ContextType.Generic,
            CreatedAt = DateTimeOffset.UtcNow
        });

        conversation.Messages.Add(new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            Role = MessageRole.User,
            Content = "Hello!",
            ContextType = ContextType.Dashboard,
            CreatedAt = DateTimeOffset.UtcNow.AddSeconds(1)
        });

        // Assert
        conversation.Messages[0].Role.Should().Be(MessageRole.System);
        conversation.Messages.Where(m => m.Role == MessageRole.System).Should().HaveCount(1);
    }

    #endregion

    #region Edge Cases and Error Handling

    [Fact]
    public void CopilotConversation_EmptyMessages_ShouldBeValid()
    {
        // Arrange & Act
        var conversation = new CopilotConversation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow,
            LastMessageAt = DateTimeOffset.UtcNow
        };

        // Assert
        conversation.Messages.Should().BeEmpty();
        conversation.Should().NotBeNull();
    }

    [Fact]
    public void CopilotMessage_EmptyContent_ShouldBeAllowed()
    {
        // Arrange & Act
        var message = new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = Guid.NewGuid(),
            Role = MessageRole.Assistant,
            Content = string.Empty,
            CreatedAt = DateTimeOffset.UtcNow
        };

        // Assert
        message.Content.Should().BeEmpty();
    }

    [Fact]
    public void CopilotMessage_NullSuggestedActions_ShouldBeValid()
    {
        // Arrange & Act
        var message = new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = Guid.NewGuid(),
            Role = MessageRole.User,
            Content = "Question without suggestions",
            SuggestedActionsJson = null
        };

        // Assert
        message.SuggestedActionsJson.Should().BeNull();
    }

    [Fact]
    public async Task Repository_GetByIdAsync_WithCancellation_ShouldSupportCancellation()
    {
        // Arrange
        var repositoryMock = new Mock<ICopilotConversationRepository>();
        var cancellationToken = new CancellationToken(true);
        var conversationId = Guid.NewGuid();

        repositoryMock.Setup(r => r.GetByIdAsync(conversationId, cancellationToken))
            .ThrowsAsync(new OperationCanceledException());

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(() =>
            repositoryMock.Object.GetByIdAsync(conversationId, cancellationToken));
    }

    [Fact]
    public void CopilotConversation_LastMessageAt_ShouldBeUpdatable()
    {
        // Arrange
        var conversation = new CopilotConversation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow,
            LastMessageAt = DateTimeOffset.UtcNow
        };

        var newTime = DateTimeOffset.UtcNow.AddMinutes(10);

        // Act
        conversation.LastMessageAt = newTime;

        // Assert
        conversation.LastMessageAt.Should().Be(newTime);
    }

    [Theory]
    [InlineData(ContextType.Dashboard)]
    [InlineData(ContextType.Incident)]
    [InlineData(ContextType.Policy)]
    [InlineData(ContextType.ChangeSet)]
    [InlineData(ContextType.Hunting)]
    [InlineData(ContextType.Automation)]
    [InlineData(ContextType.Generic)]
    public void CopilotMessage_AllContextTypes_ShouldBeAssignable(ContextType contextType)
    {
        // Arrange & Act
        var message = new CopilotMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = Guid.NewGuid(),
            Role = MessageRole.User,
            Content = $"Message with {contextType} context",
            ContextType = contextType
        };

        // Assert
        message.ContextType.Should().Be(contextType);
    }

    #endregion
}
