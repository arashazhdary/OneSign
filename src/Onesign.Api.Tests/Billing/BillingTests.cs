using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Billing.Application.Commands;
using Onesign.Modules.Billing.Application.Queries;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;

namespace Onesign.Api.Tests.Billing;

#region CreateSubscriptionCommand Tests

public class CreateSubscriptionCommandTests
{
    [Fact]
    public void CreateSubscriptionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateSubscriptionCommand
        {
            TenantId = Guid.NewGuid(),
            PlanId = Guid.NewGuid(),
            BillingPeriod = (int)BillingPeriod.Monthly,
            StartDate = DateTime.UtcNow,
            AutoRenew = true,
            PaymentMethodId = Guid.NewGuid()
        };

        // Assert
        command.TenantId.Should().NotBeEmpty();
        command.BillingPeriod.Should().Be((int)BillingPeriod.Monthly);
        command.AutoRenew.Should().BeTrue();
    }
}

#endregion

#region UpdateSubscriptionCommand Tests

public class UpdateSubscriptionCommandTests
{
    [Fact]
    public void UpdateSubscriptionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateSubscriptionCommand
        {
            TenantId = Guid.NewGuid(),
            SubscriptionId = Guid.NewGuid(),
            PlanId = Guid.NewGuid(),
            AutoRenew = false
        };

        // Assert
        command.SubscriptionId.Should().NotBeEmpty();
        command.AutoRenew.Should().BeFalse();
    }
}

#endregion

#region CancelSubscriptionCommand Tests

public class CancelSubscriptionCommandTests
{
    [Fact]
    public void CancelSubscriptionCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CancelSubscriptionCommand
        {
            TenantId = Guid.NewGuid(),
            SubscriptionId = Guid.NewGuid(),
            Reason = "No longer need the service",
            CancelAtPeriodEnd = true
        };

        // Assert
        command.Reason.Should().Be("No longer need the service");
        command.CancelAtPeriodEnd.Should().BeTrue();
    }
}

#endregion

#region ProcessPaymentCommand Tests

public class ProcessPaymentCommandTests
{
    [Fact]
    public void ProcessPaymentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ProcessPaymentCommand
        {
            TenantId = Guid.NewGuid(),
            InvoiceId = Guid.NewGuid(),
            PaymentMethodId = Guid.NewGuid(),
            Amount = 99.99m
        };

        // Assert
        command.Amount.Should().Be(99.99m);
        command.InvoiceId.Should().NotBeEmpty();
    }
}

#endregion

#region CreateInvoiceCommand Tests

public class CreateInvoiceCommandTests
{
    [Fact]
    public void CreateInvoiceCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateInvoiceCommand
        {
            TenantId = Guid.NewGuid(),
            SubscriptionId = Guid.NewGuid(),
            BillingPeriodStart = DateTime.UtcNow,
            BillingPeriodEnd = DateTime.UtcNow.AddMonths(1),
            DueDate = DateTime.UtcNow.AddDays(30),
            LineItems = new List<InvoiceLineItemRequest>
            {
                new InvoiceLineItemRequest
                {
                    Description = "Enterprise Plan - Monthly",
                    Quantity = 1,
                    UnitPrice = 199.99m
                }
            }
        };

        // Assert
        command.LineItems.Should().HaveCount(1);
        command.LineItems.First().UnitPrice.Should().Be(199.99m);
    }
}

#endregion

#region AddPaymentMethodCommand Tests

public class AddPaymentMethodCommandTests
{
    [Fact]
    public void AddPaymentMethodCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new AddPaymentMethodCommand
        {
            TenantId = Guid.NewGuid(),
            Type = (int)PaymentMethodType.CreditCard,
            IsDefault = true,
            Details = new Dictionary<string, string>
            {
                { "last4", "4242" },
                { "brand", "Visa" },
                { "expMonth", "12" },
                { "expYear", "2025" }
            }
        };

        // Assert
        command.Type.Should().Be((int)PaymentMethodType.CreditCard);
        command.IsDefault.Should().BeTrue();
        command.Details.Should().ContainKey("last4");
    }
}

#endregion

#region GetSubscriptionQuery Tests

public class GetSubscriptionQueryTests
{
    [Fact]
    public void GetSubscriptionQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var tenantId = Guid.NewGuid();
        var query = new GetSubscriptionQuery
        {
            TenantId = tenantId
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
    }
}

#endregion

#region GetInvoicesQuery Tests

public class GetInvoicesQueryTests
{
    [Fact]
    public void GetInvoicesQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetInvoicesQuery
        {
            TenantId = Guid.NewGuid(),
            Status = (int)InvoiceStatus.Paid,
            StartDate = DateTime.UtcNow.AddMonths(-6),
            EndDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.Status.Should().Be((int)InvoiceStatus.Paid);
    }
}

#endregion

#region GetPaymentHistoryQuery Tests

public class GetPaymentHistoryQueryTests
{
    [Fact]
    public void GetPaymentHistoryQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetPaymentHistoryQuery
        {
            TenantId = Guid.NewGuid(),
            StartDate = DateTime.UtcNow.AddYears(-1),
            EndDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 50
        };

        // Assert
        query.PageSize.Should().Be(50);
    }
}

#endregion

#region GetUsageMetricsQuery Tests

public class GetUsageMetricsQueryTests
{
    [Fact]
    public void GetUsageMetricsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetUsageMetricsQuery
        {
            TenantId = Guid.NewGuid(),
            MetricType = "active_users",
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow
        };

        // Assert
        query.MetricType.Should().Be("active_users");
    }
}

#endregion

#region Subscription Entity Tests

public class SubscriptionEntityTests
{
    [Fact]
    public void Subscription_ShouldBeCreatedWithActiveStatus()
    {
        // Arrange & Act
        var subscription = new Subscription(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            BillingPeriod.Monthly,
            DateTime.UtcNow,
            true);

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Active);
        subscription.AutoRenew.Should().BeTrue();
    }

    [Fact]
    public void Subscription_Cancel_ShouldChangeStatusToCancelled()
    {
        // Arrange
        var subscription = new Subscription(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            BillingPeriod.Monthly,
            DateTime.UtcNow,
            true);

        // Act
        subscription.Cancel("No longer needed", false);

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Cancelled);
        subscription.CancelledAt.Should().NotBeNull();
    }

    [Fact]
    public void Subscription_Suspend_ShouldChangeStatusToSuspended()
    {
        // Arrange
        var subscription = new Subscription(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            BillingPeriod.Monthly,
            DateTime.UtcNow,
            true);

        // Act
        subscription.Suspend("Payment failed");

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Suspended);
    }

    [Fact]
    public void Subscription_Renew_ShouldUpdateEndDate()
    {
        // Arrange
        var subscription = new Subscription(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            BillingPeriod.Monthly,
            DateTime.UtcNow,
            true);

        var newEndDate = DateTime.UtcNow.AddMonths(2);

        // Act
        subscription.Renew(newEndDate);

        // Assert
        subscription.EndDate.Should().Be(newEndDate);
    }
}

#endregion

#region Invoice Entity Tests

public class InvoiceEntityTests
{
    [Fact]
    public void Invoice_ShouldBeCreatedWithDraftStatus()
    {
        // Arrange & Act
        var invoice = new Invoice(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            DateTime.UtcNow,
            DateTime.UtcNow.AddMonths(1),
            DateTime.UtcNow.AddDays(30));

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Draft);
    }

    [Fact]
    public void Invoice_Finalize_ShouldChangeStatusToPending()
    {
        // Arrange
        var invoice = new Invoice(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            DateTime.UtcNow,
            DateTime.UtcNow.AddMonths(1),
            DateTime.UtcNow.AddDays(30));

        // Act
        invoice.Finalize();

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Pending);
    }

    [Fact]
    public void Invoice_MarkAsPaid_ShouldChangeStatusToPaid()
    {
        // Arrange
        var invoice = new Invoice(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            DateTime.UtcNow,
            DateTime.UtcNow.AddMonths(1),
            DateTime.UtcNow.AddDays(30));
        invoice.Finalize();

        // Act
        invoice.MarkAsPaid(Guid.NewGuid());

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Paid);
        invoice.PaidAt.Should().NotBeNull();
    }

    [Fact]
    public void Invoice_Void_ShouldChangeStatusToVoid()
    {
        // Arrange
        var invoice = new Invoice(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            DateTime.UtcNow,
            DateTime.UtcNow.AddMonths(1),
            DateTime.UtcNow.AddDays(30));

        // Act
        invoice.Void("Duplicate invoice");

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Void);
    }

    [Fact]
    public void Invoice_AddLineItem_ShouldCalculateTotalAmount()
    {
        // Arrange
        var invoice = new Invoice(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            DateTime.UtcNow,
            DateTime.UtcNow.AddMonths(1),
            DateTime.UtcNow.AddDays(30));

        // Act
        invoice.AddLineItem("Item 1", 2, 50.00m);
        invoice.AddLineItem("Item 2", 1, 100.00m);

        // Assert
        invoice.TotalAmount.Should().Be(200.00m);
    }
}

#endregion

#region Payment Entity Tests

public class PaymentEntityTests
{
    [Fact]
    public void Payment_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var payment = new Payment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            99.99m,
            "USD");

        // Assert
        payment.Amount.Should().Be(99.99m);
        payment.Currency.Should().Be("USD");
        payment.Status.Should().Be(PaymentStatus.Pending);
    }

    [Fact]
    public void Payment_Succeed_ShouldChangeStatusToSucceeded()
    {
        // Arrange
        var payment = new Payment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            99.99m,
            "USD");

        // Act
        payment.Succeed("txn_123456");

        // Assert
        payment.Status.Should().Be(PaymentStatus.Succeeded);
        payment.TransactionId.Should().Be("txn_123456");
    }

    [Fact]
    public void Payment_Fail_ShouldChangeStatusToFailed()
    {
        // Arrange
        var payment = new Payment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            99.99m,
            "USD");

        // Act
        payment.Fail("Insufficient funds");

        // Assert
        payment.Status.Should().Be(PaymentStatus.Failed);
        payment.FailureReason.Should().Be("Insufficient funds");
    }
}

#endregion

#region BillingPeriod Enum Tests

public class BillingPeriodEnumTests
{
    [Theory]
    [InlineData(BillingPeriod.Monthly)]
    [InlineData(BillingPeriod.Quarterly)]
    [InlineData(BillingPeriod.Yearly)]
    public void BillingPeriod_ShouldHaveCorrectValues(BillingPeriod period)
    {
        // Assert
        period.Should().BeDefined();
    }
}

#endregion

#region SubscriptionStatus Enum Tests

public class SubscriptionStatusEnumTests
{
    [Theory]
    [InlineData(SubscriptionStatus.Active)]
    [InlineData(SubscriptionStatus.Cancelled)]
    [InlineData(SubscriptionStatus.Expired)]
    [InlineData(SubscriptionStatus.Suspended)]
    [InlineData(SubscriptionStatus.PendingActivation)]
    public void SubscriptionStatus_ShouldHaveCorrectValues(SubscriptionStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion

#region InvoiceStatus Enum Tests

public class InvoiceStatusEnumTests
{
    [Theory]
    [InlineData(InvoiceStatus.Draft)]
    [InlineData(InvoiceStatus.Pending)]
    [InlineData(InvoiceStatus.Paid)]
    [InlineData(InvoiceStatus.Overdue)]
    [InlineData(InvoiceStatus.Void)]
    public void InvoiceStatus_ShouldHaveCorrectValues(InvoiceStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion

#region PaymentStatus Enum Tests

public class PaymentStatusEnumTests
{
    [Theory]
    [InlineData(PaymentStatus.Pending)]
    [InlineData(PaymentStatus.Processing)]
    [InlineData(PaymentStatus.Succeeded)]
    [InlineData(PaymentStatus.Failed)]
    [InlineData(PaymentStatus.Refunded)]
    public void PaymentStatus_ShouldHaveCorrectValues(PaymentStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion

#region PaymentMethodType Enum Tests

public class PaymentMethodTypeEnumTests
{
    [Theory]
    [InlineData(PaymentMethodType.CreditCard)]
    [InlineData(PaymentMethodType.BankTransfer)]
    [InlineData(PaymentMethodType.DirectDebit)]
    public void PaymentMethodType_ShouldHaveCorrectValues(PaymentMethodType type)
    {
        // Assert
        type.Should().BeDefined();
    }
}

#endregion
