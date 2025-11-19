using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Crypto.Application.Commands;
using Onesign.Modules.Crypto.Application.Queries;
using Onesign.Modules.Crypto.Domain.Entities;
using Onesign.Modules.Crypto.Domain.Enums;
using Onesign.Modules.Crypto.Domain.Repositories;
using Onesign.Modules.Crypto.Domain.Services;

namespace Onesign.Api.Tests.Crypto;

#region CreateKeyCommand Tests

public class CreateKeyCommandTests
{
    [Fact]
    public void CreateKeyCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateKeyCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Master Encryption Key",
            KeyType = (int)KeyType.Symmetric,
            Algorithm = (int)EncryptionAlgorithm.AES256,
            Purpose = (int)KeyPurpose.Encryption,
            ExpiresAt = DateTime.UtcNow.AddYears(1),
            IsRotatable = true
        };

        // Assert
        command.Name.Should().Be("Master Encryption Key");
        command.KeyType.Should().Be((int)KeyType.Symmetric);
        command.Algorithm.Should().Be((int)EncryptionAlgorithm.AES256);
    }
}

#endregion

#region RotateKeyCommand Tests

public class RotateKeyCommandTests
{
    [Fact]
    public void RotateKeyCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RotateKeyCommand
        {
            TenantId = Guid.NewGuid(),
            KeyId = Guid.NewGuid(),
            Reason = "Scheduled rotation"
        };

        // Assert
        command.KeyId.Should().NotBeEmpty();
        command.Reason.Should().Be("Scheduled rotation");
    }
}

#endregion

#region RevokeKeyCommand Tests

public class RevokeKeyCommandTests
{
    [Fact]
    public void RevokeKeyCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RevokeKeyCommand
        {
            TenantId = Guid.NewGuid(),
            KeyId = Guid.NewGuid(),
            Reason = "Compromised"
        };

        // Assert
        command.Reason.Should().Be("Compromised");
    }
}

#endregion

#region EncryptDataCommand Tests

public class EncryptDataCommandTests
{
    [Fact]
    public void EncryptDataCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new EncryptDataCommand
        {
            TenantId = Guid.NewGuid(),
            KeyId = Guid.NewGuid(),
            Plaintext = "sensitive data",
            Context = new Dictionary<string, string>
            {
                { "userId", "123" }
            }
        };

        // Assert
        command.Plaintext.Should().Be("sensitive data");
        command.Context.Should().ContainKey("userId");
    }
}

#endregion

#region DecryptDataCommand Tests

public class DecryptDataCommandTests
{
    [Fact]
    public void DecryptDataCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new DecryptDataCommand
        {
            TenantId = Guid.NewGuid(),
            KeyId = Guid.NewGuid(),
            Ciphertext = "encrypted_data_base64",
            Context = new Dictionary<string, string>()
        };

        // Assert
        command.Ciphertext.Should().Be("encrypted_data_base64");
    }
}

#endregion

#region SignDataCommand Tests

public class SignDataCommandTests
{
    [Fact]
    public void SignDataCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new SignDataCommand
        {
            TenantId = Guid.NewGuid(),
            KeyId = Guid.NewGuid(),
            Data = "data to sign",
            Algorithm = (int)SigningAlgorithm.RSA_SHA256
        };

        // Assert
        command.Data.Should().Be("data to sign");
        command.Algorithm.Should().Be((int)SigningAlgorithm.RSA_SHA256);
    }
}

#endregion

#region VerifySignatureCommand Tests

public class VerifySignatureCommandTests
{
    [Fact]
    public void VerifySignatureCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new VerifySignatureCommand
        {
            TenantId = Guid.NewGuid(),
            KeyId = Guid.NewGuid(),
            Data = "original data",
            Signature = "signature_base64",
            Algorithm = (int)SigningAlgorithm.RSA_SHA256
        };

        // Assert
        command.Signature.Should().Be("signature_base64");
    }
}

#endregion

#region GetKeysQuery Tests

public class GetKeysQueryTests
{
    [Fact]
    public void GetKeysQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetKeysQuery
        {
            TenantId = Guid.NewGuid(),
            KeyType = (int)KeyType.Asymmetric,
            Purpose = (int)KeyPurpose.Signing,
            Status = (int)KeyStatus.Active,
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.KeyType.Should().Be((int)KeyType.Asymmetric);
        query.Purpose.Should().Be((int)KeyPurpose.Signing);
    }
}

#endregion

#region GetKeyDetailsQuery Tests

public class GetKeyDetailsQueryTests
{
    [Fact]
    public void GetKeyDetailsQuery_ShouldHaveKeyId()
    {
        // Arrange & Act
        var keyId = Guid.NewGuid();
        var query = new GetKeyDetailsQuery
        {
            TenantId = Guid.NewGuid(),
            KeyId = keyId
        };

        // Assert
        query.KeyId.Should().Be(keyId);
    }
}

#endregion

#region GetKeyVersionsQuery Tests

public class GetKeyVersionsQueryTests
{
    [Fact]
    public void GetKeyVersionsQuery_ShouldHaveKeyId()
    {
        // Arrange & Act
        var query = new GetKeyVersionsQuery
        {
            TenantId = Guid.NewGuid(),
            KeyId = Guid.NewGuid()
        };

        // Assert
        query.KeyId.Should().NotBeEmpty();
    }
}

#endregion

#region CryptoKey Entity Tests

public class CryptoKeyEntityTests
{
    [Fact]
    public void CryptoKey_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var key = new CryptoKey(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Key",
            KeyType.Symmetric,
            EncryptionAlgorithm.AES256,
            KeyPurpose.Encryption,
            DateTime.UtcNow.AddYears(1));

        // Assert
        key.Name.Should().Be("Test Key");
        key.Status.Should().Be(KeyStatus.Active);
        key.KeyType.Should().Be(KeyType.Symmetric);
    }

    [Fact]
    public void CryptoKey_Rotate_ShouldIncrementVersion()
    {
        // Arrange
        var key = new CryptoKey(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Key",
            KeyType.Symmetric,
            EncryptionAlgorithm.AES256,
            KeyPurpose.Encryption,
            DateTime.UtcNow.AddYears(1));

        var initialVersion = key.CurrentVersion;

        // Act
        key.Rotate("Scheduled");

        // Assert
        key.CurrentVersion.Should().Be(initialVersion + 1);
        key.RotatedAt.Should().NotBeNull();
    }

    [Fact]
    public void CryptoKey_Revoke_ShouldChangeStatusToRevoked()
    {
        // Arrange
        var key = new CryptoKey(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Key",
            KeyType.Symmetric,
            EncryptionAlgorithm.AES256,
            KeyPurpose.Encryption,
            DateTime.UtcNow.AddYears(1));

        // Act
        key.Revoke("Compromised");

        // Assert
        key.Status.Should().Be(KeyStatus.Revoked);
        key.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public void CryptoKey_Expire_ShouldChangeStatusToExpired()
    {
        // Arrange
        var key = new CryptoKey(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Key",
            KeyType.Symmetric,
            EncryptionAlgorithm.AES256,
            KeyPurpose.Encryption,
            DateTime.UtcNow.AddYears(1));

        // Act
        key.Expire();

        // Assert
        key.Status.Should().Be(KeyStatus.Expired);
    }
}

#endregion

#region KeyVersion Entity Tests

public class KeyVersionEntityTests
{
    [Fact]
    public void KeyVersion_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var version = new KeyVersion(
            Guid.NewGuid(),
            Guid.NewGuid(),
            1,
            "encrypted_key_material");

        // Assert
        version.Version.Should().Be(1);
        version.IsActive.Should().BeTrue();
    }

    [Fact]
    public void KeyVersion_Deactivate_ShouldSetIsActiveToFalse()
    {
        // Arrange
        var version = new KeyVersion(
            Guid.NewGuid(),
            Guid.NewGuid(),
            1,
            "material");

        // Act
        version.Deactivate();

        // Assert
        version.IsActive.Should().BeFalse();
    }
}

#endregion

#region KeyType Enum Tests

public class KeyTypeEnumTests
{
    [Theory]
    [InlineData(KeyType.Symmetric)]
    [InlineData(KeyType.Asymmetric)]
    public void KeyType_ShouldHaveCorrectValues(KeyType keyType)
    {
        // Assert
        keyType.Should().BeDefined();
    }
}

#endregion

#region EncryptionAlgorithm Enum Tests

public class EncryptionAlgorithmEnumTests
{
    [Theory]
    [InlineData(EncryptionAlgorithm.AES128)]
    [InlineData(EncryptionAlgorithm.AES256)]
    [InlineData(EncryptionAlgorithm.RSA2048)]
    [InlineData(EncryptionAlgorithm.RSA4096)]
    public void EncryptionAlgorithm_ShouldHaveCorrectValues(EncryptionAlgorithm algorithm)
    {
        // Assert
        algorithm.Should().BeDefined();
    }
}

#endregion

#region KeyPurpose Enum Tests

public class KeyPurposeEnumTests
{
    [Theory]
    [InlineData(KeyPurpose.Encryption)]
    [InlineData(KeyPurpose.Signing)]
    [InlineData(KeyPurpose.KeyWrapping)]
    [InlineData(KeyPurpose.Authentication)]
    public void KeyPurpose_ShouldHaveCorrectValues(KeyPurpose purpose)
    {
        // Assert
        purpose.Should().BeDefined();
    }
}

#endregion

#region KeyStatus Enum Tests

public class KeyStatusEnumTests
{
    [Theory]
    [InlineData(KeyStatus.Active)]
    [InlineData(KeyStatus.Inactive)]
    [InlineData(KeyStatus.Revoked)]
    [InlineData(KeyStatus.Expired)]
    [InlineData(KeyStatus.PendingDeletion)]
    public void KeyStatus_ShouldHaveCorrectValues(KeyStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion

#region SigningAlgorithm Enum Tests

public class SigningAlgorithmEnumTests
{
    [Theory]
    [InlineData(SigningAlgorithm.RSA_SHA256)]
    [InlineData(SigningAlgorithm.RSA_SHA384)]
    [InlineData(SigningAlgorithm.RSA_SHA512)]
    [InlineData(SigningAlgorithm.ECDSA_P256)]
    [InlineData(SigningAlgorithm.ECDSA_P384)]
    public void SigningAlgorithm_ShouldHaveCorrectValues(SigningAlgorithm algorithm)
    {
        // Assert
        algorithm.Should().BeDefined();
    }
}

#endregion
