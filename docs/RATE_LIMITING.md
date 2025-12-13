# Rate Limiting and Login Lockout Documentation

## Overview

The OneSign application implements a comprehensive rate limiting and login lockout mechanism to protect against brute force attacks and abuse of the authentication endpoints.

## Features

### 1. Basic Rate Limiting (Per-Minute)
- Limits login requests to **5 per minute per IP address**
- Returns `429 Too Many Requests` when limit is exceeded
- Implemented via `RateLimitMiddleware.cs`

### 2. Failed Login Attempt Tracking
- Tracks failed login attempts per IP address over a **15-minute window**
- Implemented via `LoginAttemptTracker` service

### 3. Account Lockout
- Locks out IP addresses after **10 failed login attempts** within 15 minutes
- Lockout duration: **30 minutes** (configurable)
- Automatically clears failed attempts on successful login
- Returns `429 Too Many Requests` with detailed lockout information

## Architecture

### Components

#### 1. LoginAttemptTracker Service
**Location**: `/src/Onesign.Api/Services/LoginAttemptTracker.cs`

A singleton service that:
- Records failed login attempts with timestamps
- Tracks lockout status for each IP address
- Uses sliding window algorithm for accurate tracking
- Automatically cleans up old entries every 5 minutes

**Interface**:
```csharp
public interface ILoginAttemptTracker
{
    void RecordFailedAttempt(string ipAddress);
    bool IsLockedOut(string ipAddress);
    TimeSpan GetRemainingLockoutTime(string ipAddress);
    void ClearFailedAttempts(string ipAddress);
    int GetFailedAttemptCount(string ipAddress);
}
```

#### 2. LoginLockoutMiddleware
**Location**: `/src/Onesign.Api/Middleware/LoginLockoutMiddleware.cs`

Middleware that:
- Intercepts login requests
- Checks if the IP is locked out
- Returns 429 response with lockout details if locked
- Allows request to proceed if not locked

**Applied to endpoints**:
- `/api/auth/login`
- `/api/auth/google-login`

#### 3. AuthController Updates
**Location**: `/src/Onesign.Api/Controllers/Auth/AuthController.cs`

The AuthController now:
- Tracks failed login attempts on authentication failure
- Clears failed attempts on successful login
- Extracts client IP from request headers (supports X-Forwarded-For and X-Real-IP)

#### 4. Configuration
**Location**: `/src/Onesign.Api/Configuration/RateLimitOptions.cs`

Centralized configuration class for all rate limiting settings.

## Configuration

### appsettings.json

```json
{
  "RateLimit": {
    "MaxRequestsPerMinute": 5,
    "WindowMinutes": 1,
    "Lockout": {
      "MaxFailedAttempts": 10,
      "TrackingWindowMinutes": 15,
      "LockoutDurationMinutes": 30
    }
  }
}
```

### Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `MaxRequestsPerMinute` | 5 | Maximum login requests per minute per IP |
| `WindowMinutes` | 1 | Time window for rate limiting |
| `Lockout.MaxFailedAttempts` | 10 | Failed attempts before lockout |
| `Lockout.TrackingWindowMinutes` | 15 | Time window to track failed attempts |
| `Lockout.LockoutDurationMinutes` | 30 | Duration of lockout |

## Middleware Pipeline Order

The middleware is registered in the following order in `Program.cs`:

```
1. SecurityHeadersMiddleware
2. GlobalExceptionHandlerMiddleware
3. RateLimitMiddleware (Basic rate limiting)
4. LoginLockoutMiddleware (Failed attempt lockout) ← NEW
5. LocalizationMiddleware
6. JwtAuthenticationMiddleware
7. TenantIsolationMiddleware
8. TenantStatusMiddleware
9. TenantRateLimitMiddleware
10. Authentication & Authorization
```

## Response Examples

### 1. Rate Limit Exceeded (Basic - 5 per minute)
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "errorMessage": "Too many requests. Please try again later."
}
```

### 2. Account Locked (After 10 failed attempts)
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 1800

{
  "errorCode": "ACCOUNT_TEMPORARILY_LOCKED",
  "errorMessage": "Too many failed login attempts. Account is temporarily locked. Please try again in 30 minutes and 0 seconds.",
  "retryAfter": 1800,
  "lockoutExpiresAt": "2024-01-15T14:30:00.000Z",
  "failedAttempts": 10
}
```

## How It Works

### Successful Login Flow
1. User attempts login
2. LoginLockoutMiddleware checks if IP is locked out → Not locked
3. RateLimitMiddleware checks rate limit → Under limit
4. AuthController processes login
5. Login succeeds
6. **LoginAttemptTracker.ClearFailedAttempts()** is called
7. Return success response

### Failed Login Flow
1. User attempts login with wrong credentials
2. LoginLockoutMiddleware checks if IP is locked out → Not locked yet
3. RateLimitMiddleware checks rate limit → Under limit
4. AuthController processes login
5. Login fails (invalid credentials)
6. **LoginAttemptTracker.RecordFailedAttempt()** is called
7. If attempts >= 10, IP is locked out
8. Return unauthorized response

### Locked Out Flow
1. User attempts login from locked IP
2. **LoginLockoutMiddleware** checks lockout status → Locked!
3. Return 429 response with lockout details
4. Request does not reach AuthController

## Security Benefits

1. **Brute Force Protection**: Prevents password guessing attacks
2. **DDoS Mitigation**: Rate limiting prevents request flooding
3. **Credential Stuffing Defense**: Lockout prevents automated credential testing
4. **IP-based Tracking**: Works across multiple user accounts from same IP
5. **Automatic Cleanup**: Memory-efficient with periodic cleanup of old entries

## Proxy and Load Balancer Support

The system correctly handles IP addresses when behind proxies or load balancers by checking:
1. `X-Forwarded-For` header (first IP in chain)
2. `X-Real-IP` header
3. Direct connection IP address (fallback)

## Testing

### Test Rate Limiting
```bash
# Make 6 requests within 1 minute
for i in {1..6}; do
  curl -X POST "http://localhost:5000/api/auth/login?tenantId=YOUR_TENANT_ID" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    && echo "\nRequest $i"
done
```

### Test Lockout
```bash
# Make 11 failed login attempts
for i in {1..11}; do
  curl -X POST "http://localhost:5000/api/auth/login?tenantId=YOUR_TENANT_ID" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"WrongPassword123!"}' \
    && echo "\nAttempt $i"
  sleep 2
done
```

## Production Recommendations

1. **Adjust Lockout Duration**: Consider increasing to 60 minutes for production
2. **Monitor Logs**: Watch for patterns of locked IPs
3. **Consider Redis**: For distributed deployments, use Redis instead of in-memory storage
4. **Add Notifications**: Alert admins when IPs are locked out
5. **Implement CAPTCHA**: Add CAPTCHA after 3-5 failed attempts (before lockout)
6. **Whitelist Internal IPs**: Consider whitelisting known good IPs
7. **Rate Limit by User**: Consider tracking by username in addition to IP

## Future Enhancements

- [ ] Persistent storage (Redis/Database) for distributed environments
- [ ] Admin API to unlock IP addresses
- [ ] Configurable whitelist/blacklist
- [ ] Email notifications on lockout
- [ ] Progressive delays (increase delay with each failed attempt)
- [ ] Integration with threat intelligence feeds
- [ ] Metrics and monitoring dashboard

## Related Files

- `/src/Onesign.Api/Services/LoginAttemptTracker.cs`
- `/src/Onesign.Api/Middleware/LoginLockoutMiddleware.cs`
- `/src/Onesign.Api/Middleware/RateLimitMiddleware.cs`
- `/src/Onesign.Api/Configuration/RateLimitOptions.cs`
- `/src/Onesign.Api/Controllers/Auth/AuthController.cs`
- `/src/Onesign.Api/Program.cs`
- `/src/Onesign.Api/appsettings.json`
