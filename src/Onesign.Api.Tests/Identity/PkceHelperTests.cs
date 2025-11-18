using FluentAssertions;
using Onesign.Modules.Identity.Infrastructure.Security;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class PkceHelperTests
{
    #region GenerateCodeVerifier Tests

    [Fact]
    public void GenerateCodeVerifier_ReturnsNonEmptyString()
    {
        // Act
        var result = PkceHelper.GenerateCodeVerifier();

        // Assert
        result.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void GenerateCodeVerifier_ReturnsBase64UrlEncodedString()
    {
        // Act
        var result = PkceHelper.GenerateCodeVerifier();

        // Assert
        result.Should().NotContain("+");
        result.Should().NotContain("/");
        result.Should().NotContain("=");
    }

    [Fact]
    public void GenerateCodeVerifier_GeneratesUniqueValuesEachTime()
    {
        // Act
        var verifier1 = PkceHelper.GenerateCodeVerifier();
        var verifier2 = PkceHelper.GenerateCodeVerifier();
        var verifier3 = PkceHelper.GenerateCodeVerifier();

        // Assert
        verifier1.Should().NotBe(verifier2);
        verifier2.Should().NotBe(verifier3);
        verifier1.Should().NotBe(verifier3);
    }

    [Fact]
    public void GenerateCodeVerifier_HasExpectedLength()
    {
        // Act
        var result = PkceHelper.GenerateCodeVerifier();

        // Assert
        // 32 bytes in Base64URL encoding = 43 characters (without padding)
        result.Length.Should().BeGreaterOrEqualTo(40);
        result.Length.Should().BeLessOrEqualTo(50);
    }

    [Fact]
    public void GenerateCodeVerifier_ContainsOnlyValidCharacters()
    {
        // Act
        var result = PkceHelper.GenerateCodeVerifier();

        // Assert
        // Base64URL alphabet: A-Z, a-z, 0-9, -, _
        result.Should().MatchRegex("^[A-Za-z0-9_-]+$");
    }

    [Fact]
    public void GenerateCodeVerifier_MultipleGenerationsAllUnique()
    {
        // Act
        var verifiers = new HashSet<string>();
        for (int i = 0; i < 100; i++)
        {
            verifiers.Add(PkceHelper.GenerateCodeVerifier());
        }

        // Assert
        verifiers.Should().HaveCount(100);
    }

    #endregion

    #region GenerateCodeChallenge Tests

    [Fact]
    public void GenerateCodeChallenge_ValidVerifier_ReturnsChallenge()
    {
        // Arrange
        var verifier = PkceHelper.GenerateCodeVerifier();

        // Act
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Assert
        challenge.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void GenerateCodeChallenge_SameVerifier_ReturnsSameChallenge()
    {
        // Arrange
        var verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

        // Act
        var challenge1 = PkceHelper.GenerateCodeChallenge(verifier);
        var challenge2 = PkceHelper.GenerateCodeChallenge(verifier);

        // Assert
        challenge1.Should().Be(challenge2);
    }

    [Fact]
    public void GenerateCodeChallenge_ReturnsBase64UrlEncodedString()
    {
        // Arrange
        var verifier = PkceHelper.GenerateCodeVerifier();

        // Act
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Assert
        challenge.Should().NotContain("+");
        challenge.Should().NotContain("/");
        challenge.Should().NotContain("=");
    }

    [Fact]
    public void GenerateCodeChallenge_DifferentVerifiers_ReturnDifferentChallenges()
    {
        // Arrange
        var verifier1 = "verifier1-test-value";
        var verifier2 = "verifier2-test-value";

        // Act
        var challenge1 = PkceHelper.GenerateCodeChallenge(verifier1);
        var challenge2 = PkceHelper.GenerateCodeChallenge(verifier2);

        // Assert
        challenge1.Should().NotBe(challenge2);
    }

    [Fact]
    public void GenerateCodeChallenge_HasExpectedLength()
    {
        // Arrange
        var verifier = PkceHelper.GenerateCodeVerifier();

        // Act
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Assert
        // SHA256 produces 32 bytes, Base64URL encoded = 43 characters
        challenge.Length.Should().BeGreaterOrEqualTo(40);
        challenge.Length.Should().BeLessOrEqualTo(50);
    }

    [Fact]
    public void GenerateCodeChallenge_EmptyVerifier_ReturnsChallenge()
    {
        // Arrange
        var verifier = "";

        // Act
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Assert
        challenge.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void GenerateCodeChallenge_ContainsOnlyValidCharacters()
    {
        // Arrange
        var verifier = PkceHelper.GenerateCodeVerifier();

        // Act
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Assert
        challenge.Should().MatchRegex("^[A-Za-z0-9_-]+$");
    }

    #endregion

    #region VerifyCodeChallenge Tests

    [Fact]
    public void VerifyCodeChallenge_MatchingPair_ReturnsTrue()
    {
        // Arrange
        var verifier = PkceHelper.GenerateCodeVerifier();
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Act
        var result = PkceHelper.VerifyCodeChallenge(verifier, challenge);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyCodeChallenge_NonMatchingPair_ReturnsFalse()
    {
        // Arrange
        var verifier = PkceHelper.GenerateCodeVerifier();
        var wrongChallenge = "wrong-challenge-value";

        // Act
        var result = PkceHelper.VerifyCodeChallenge(verifier, wrongChallenge);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyCodeChallenge_WrongVerifier_ReturnsFalse()
    {
        // Arrange
        var verifier = PkceHelper.GenerateCodeVerifier();
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);
        var wrongVerifier = "wrong-verifier";

        // Act
        var result = PkceHelper.VerifyCodeChallenge(wrongVerifier, challenge);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyCodeChallenge_EmptyVerifier_HandlesCorrectly()
    {
        // Arrange
        var verifier = "";
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Act
        var result = PkceHelper.VerifyCodeChallenge(verifier, challenge);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyCodeChallenge_EmptyChallenge_ReturnsFalse()
    {
        // Arrange
        var verifier = PkceHelper.GenerateCodeVerifier();
        var emptyChallenge = "";

        // Act
        var result = PkceHelper.VerifyCodeChallenge(verifier, emptyChallenge);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyCodeChallenge_CaseSensitive()
    {
        // Arrange
        var verifier = "TestVerifier";
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);
        var wrongCaseVerifier = "testverifier";

        // Act
        var result = PkceHelper.VerifyCodeChallenge(wrongCaseVerifier, challenge);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region PKCE Flow Integration Tests

    [Fact]
    public void PkceFlow_CompleteFlow_Success()
    {
        // Arrange & Act
        // Step 1: Client generates code verifier
        var codeVerifier = PkceHelper.GenerateCodeVerifier();

        // Step 2: Client generates code challenge
        var codeChallenge = PkceHelper.GenerateCodeChallenge(codeVerifier);

        // Step 3: Server validates the code challenge
        var isValid = PkceHelper.VerifyCodeChallenge(codeVerifier, codeChallenge);

        // Assert
        isValid.Should().BeTrue();
    }

    [Fact]
    public void PkceFlow_AttackerCannotGuessVerifier()
    {
        // Arrange
        var realVerifier = PkceHelper.GenerateCodeVerifier();
        var codeChallenge = PkceHelper.GenerateCodeChallenge(realVerifier);

        // Act - Attacker tries different verifiers
        var attackerVerifiers = new[]
        {
            "attacker-verifier-1",
            "attacker-verifier-2",
            PkceHelper.GenerateCodeVerifier(),
            PkceHelper.GenerateCodeVerifier()
        };

        // Assert
        foreach (var attackerVerifier in attackerVerifiers)
        {
            var result = PkceHelper.VerifyCodeChallenge(attackerVerifier, codeChallenge);
            result.Should().BeFalse();
        }
    }

    [Fact]
    public void PkceFlow_MultipleFlows_AllIndependent()
    {
        // Arrange & Act
        var flows = new List<(string Verifier, string Challenge)>();

        for (int i = 0; i < 10; i++)
        {
            var verifier = PkceHelper.GenerateCodeVerifier();
            var challenge = PkceHelper.GenerateCodeChallenge(verifier);
            flows.Add((verifier, challenge));
        }

        // Assert
        // Each flow should verify correctly
        foreach (var (verifier, challenge) in flows)
        {
            PkceHelper.VerifyCodeChallenge(verifier, challenge).Should().BeTrue();
        }

        // Cross-flow validation should fail
        for (int i = 0; i < flows.Count - 1; i++)
        {
            PkceHelper.VerifyCodeChallenge(flows[i].Verifier, flows[i + 1].Challenge)
                .Should().BeFalse();
        }
    }

    #endregion

    #region RFC 7636 Compliance Tests

    [Fact]
    public void GenerateCodeVerifier_MeetsMinimumLengthRequirement()
    {
        // RFC 7636 requires minimum 43 characters
        // Act
        var verifier = PkceHelper.GenerateCodeVerifier();

        // Assert
        verifier.Length.Should().BeGreaterOrEqualTo(43);
    }

    [Fact]
    public void GenerateCodeChallenge_UsesSHA256()
    {
        // Known test vector
        // Verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
        // Expected Challenge (SHA256 S256): "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

        // Arrange
        var verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
        var expectedChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

        // Act
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Assert
        challenge.Should().Be(expectedChallenge);
    }

    [Fact]
    public void GenerateCodeVerifier_ProducesUnreservedCharactersOnly()
    {
        // RFC 7636: ABNF: code-verifier = 43*128unreserved
        // unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"

        // Act
        var verifier = PkceHelper.GenerateCodeVerifier();

        // Assert
        verifier.Should().MatchRegex("^[A-Za-z0-9._~-]+$");
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void GenerateCodeChallenge_SpecialCharactersInVerifier_HandlesCorrectly()
    {
        // Arrange
        var verifier = "special-_characters~in.verifier";

        // Act
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Assert
        challenge.Should().NotBeNullOrEmpty();
        PkceHelper.VerifyCodeChallenge(verifier, challenge).Should().BeTrue();
    }

    [Fact]
    public void VerifyCodeChallenge_WhitespaceInVerifier_TreatedAsDistinct()
    {
        // Arrange
        var verifier = "verifier-with-spaces";
        var verifierWithSpace = "verifier-with- spaces";
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Act
        var result = PkceHelper.VerifyCodeChallenge(verifierWithSpace, challenge);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void GenerateCodeChallenge_LongVerifier_HandlesCorrectly()
    {
        // Arrange
        var verifier = new string('a', 128); // Max allowed by RFC

        // Act
        var challenge = PkceHelper.GenerateCodeChallenge(verifier);

        // Assert
        challenge.Should().NotBeNullOrEmpty();
        PkceHelper.VerifyCodeChallenge(verifier, challenge).Should().BeTrue();
    }

    #endregion
}
