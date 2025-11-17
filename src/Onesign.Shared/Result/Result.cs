namespace Onesign.Shared.Result;

public class Result
{
    public bool IsSuccess { get; private set; }
    public bool IsFailure => !IsSuccess;
    public string? ErrorCode { get; private set; }
    public string? ErrorMessage { get; private set; }

    protected Result(bool isSuccess, string? errorCode = null, string? errorMessage = null)
    {
        IsSuccess = isSuccess;
        ErrorCode = errorCode;
        ErrorMessage = errorMessage;
    }

    public static Result Success() => new(true);
    public static Result Failure(string errorCode, string? errorMessage = null) => new(false, errorCode, errorMessage);
    public static Result<T> Success<T>(T value) => new(value, true);
    public static Result<T> Failure<T>(string errorCode, string? errorMessage = null) => new(default, false, errorCode, errorMessage);
}

public class Result<T> : Result
{
    public T? Value { get; private set; }

    internal Result(T? value, bool isSuccess, string? errorCode = null, string? errorMessage = null)
        : base(isSuccess, errorCode, errorMessage)
    {
        Value = value;
    }
}

