# Tenant Branding API - Caching Implementation Guide

## Overview

This guide explains how to implement server-side caching headers and ETag support for the `/api/tenant/branding` endpoint to work optimally with the client-side localStorage caching.

## Required Response Headers

### 1. Cache-Control

Add the following Cache-Control header to the branding API response:

```
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

**Explanation:**
- `public`: Response can be cached by any cache (browser, CDN, proxy)
- `max-age=3600`: Response is fresh for 1 hour (3600 seconds)
- `stale-while-revalidate=86400`: After expiration, serve stale content for up to 24 hours while revalidating in the background

### 2. ETag

Generate and include an ETag header for each branding response:

```
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

**Implementation Options:**
1. **Hash-based**: Generate MD5/SHA-256 hash of the branding JSON
2. **Version-based**: Use a version number or last-modified timestamp
3. **Database-based**: Store and return a version/revision field from database

### 3. Last-Modified (Optional but Recommended)

```
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
```

## API Implementation Examples

### Node.js/Express Example

```javascript
const crypto = require('crypto');

app.get('/api/tenant/branding', async (req, res) => {
  const { tenantId } = req.query;

  // Fetch branding data
  const branding = await getBrandingFromDatabase(tenantId);

  // Generate ETag from content
  const etag = crypto
    .createHash('md5')
    .update(JSON.stringify(branding))
    .digest('hex');

  // Check If-None-Match header for conditional request
  const clientEtag = req.headers['if-none-match'];

  if (clientEtag === etag) {
    // Content hasn't changed, return 304
    return res.status(304).end();
  }

  // Set caching headers
  res.set({
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    'ETag': etag,
    'Last-Modified': branding.updatedAt.toUTCString(),
  });

  res.json(branding);
});
```

### Python/FastAPI Example

```python
from hashlib import md5
from datetime import datetime
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/api/tenant/branding")
async def get_tenant_branding(
    request: Request,
    tenant_id: str,
    response: Response
):
    # Fetch branding data
    branding = await get_branding_from_database(tenant_id)

    # Generate ETag
    branding_json = json.dumps(branding, sort_keys=True)
    etag = md5(branding_json.encode()).hexdigest()

    # Check If-None-Match header
    client_etag = request.headers.get('if-none-match')

    if client_etag == etag:
        return Response(status_code=status.HTTP_304_NOT_MODIFIED)

    # Set caching headers
    response.headers['Cache-Control'] = 'public, max-age=3600, stale-while-revalidate=86400'
    response.headers['ETag'] = etag
    response.headers['Last-Modified'] = branding['updated_at']

    return branding
```

### Go/Gin Example

```go
package main

import (
    "crypto/md5"
    "encoding/hex"
    "encoding/json"
    "net/http"
    "github.com/gin-gonic/gin"
)

func getTenantBranding(c *gin.Context) {
    tenantID := c.Query("tenantId")

    // Fetch branding data
    branding, err := getBrandingFromDatabase(tenantID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // Generate ETag
    brandingJSON, _ := json.Marshal(branding)
    hash := md5.Sum(brandingJSON)
    etag := hex.EncodeToString(hash[:])

    // Check If-None-Match header
    clientEtag := c.GetHeader("If-None-Match")

    if clientEtag == etag {
        c.Status(http.StatusNotModified)
        return
    }

    // Set caching headers
    c.Header("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400")
    c.Header("ETag", etag)
    c.Header("Last-Modified", branding.UpdatedAt.Format(http.TimeFormat))

    c.JSON(http.StatusOK, branding)
}
```

## Conditional Request Flow

### Client-Side Request Process

1. **First Request** (No cache):
   ```
   GET /api/tenant/branding?tenantId=123
   ```

2. **Server Response**:
   ```
   HTTP/1.1 200 OK
   Cache-Control: public, max-age=3600, stale-while-revalidate=86400
   ETag: "abc123def456"
   Content-Type: application/json

   { "logoUrl": "...", "primaryColor": "#6366f1", ... }
   ```

3. **Subsequent Request** (With cached ETag):
   ```
   GET /api/tenant/branding?tenantId=123
   If-None-Match: "abc123def456"
   ```

4. **Server Response** (Not Modified):
   ```
   HTTP/1.1 304 Not Modified
   Cache-Control: public, max-age=3600, stale-while-revalidate=86400
   ETag: "abc123def456"
   ```

## Benefits

### Performance Improvements

1. **Reduced Bandwidth**: 304 responses have no body, saving bandwidth
2. **Faster Load Times**: No need to re-parse JSON when content hasn't changed
3. **Better UX**: Instant display of cached branding while validating in background
4. **Reduced Server Load**: Fewer full responses to generate

### Caching Strategy

The client implements a **stale-while-revalidate** pattern:

- **Fresh Cache** (< 1 hour old): Returns immediately, no API call
- **Stale Cache** (> 1 hour old): Returns cached data immediately + fetches in background
- **ETag Match**: Server returns 304, client updates timestamp only
- **ETag Mismatch**: Server returns new data, client updates cache

## Testing

### Test Cache Headers

```bash
# Test initial request
curl -I "http://localhost:7000/api/tenant/branding?tenantId=123"

# Expected headers:
# Cache-Control: public, max-age=3600, stale-while-revalidate=86400
# ETag: "abc123..."
```

### Test Conditional Request

```bash
# Test with If-None-Match
curl -I "http://localhost:7000/api/tenant/branding?tenantId=123" \
  -H "If-None-Match: \"abc123...\""

# Expected: HTTP/1.1 304 Not Modified
```

### Test ETag Generation Consistency

```bash
# Multiple requests should return same ETag if data unchanged
curl "http://localhost:7000/api/tenant/branding?tenantId=123" | jq .
curl -I "http://localhost:7000/api/tenant/branding?tenantId=123"
curl -I "http://localhost:7000/api/tenant/branding?tenantId=123"

# ETags should match if data unchanged
```

## Cache Invalidation

### When to Invalidate

Invalidate the cache when branding is updated:

1. **Update branding version/timestamp** in database
2. **Generate new ETag** for the updated content
3. **Client will automatically** detect change and update cache

### Example: Update Endpoint

```javascript
app.put('/api/tenant/branding', async (req, res) => {
  const { tenantId } = req.query;
  const branding = req.body;

  // Update in database with new timestamp
  await updateBrandingInDatabase(tenantId, {
    ...branding,
    updatedAt: new Date(),
  });

  // Client will get new ETag on next request
  res.json({ success: true });
});
```

## Monitoring and Debugging

### Recommended Metrics

Track these metrics in your API:

1. **Cache Hit Rate**: Ratio of 304 to 200 responses
2. **ETag Mismatches**: How often ETags change
3. **Response Times**: Compare 200 vs 304 response times

### Debug Logging

```javascript
// Log cache performance
app.get('/api/tenant/branding', async (req, res) => {
  const clientEtag = req.headers['if-none-match'];
  const branding = await getBrandingFromDatabase(tenantId);
  const serverEtag = generateETag(branding);

  console.log({
    tenantId,
    cacheHit: clientEtag === serverEtag,
    clientEtag,
    serverEtag,
  });

  // ... rest of implementation
});
```

## Best Practices

1. **ETag Generation**: Use consistent hashing (sorted keys) for JSON
2. **Cache Duration**: 1 hour is recommended, adjust based on update frequency
3. **CDN Integration**: These headers work seamlessly with CDNs
4. **Database Optimization**: Consider adding an `etag` column to avoid recalculating
5. **Compression**: Use gzip/brotli compression alongside ETag
6. **Version Control**: Update `CACHE_VERSION` in client when changing branding schema

## Troubleshooting

### Issue: ETags Keep Changing
- **Cause**: Non-deterministic JSON serialization
- **Solution**: Sort object keys before hashing

### Issue: 304 Not Being Sent
- **Cause**: Not checking `If-None-Match` header
- **Solution**: Verify conditional request handling in API

### Issue: Stale Data Being Served
- **Cause**: Cache not being invalidated on updates
- **Solution**: Ensure branding updates change the timestamp/version

## Additional Resources

- [MDN: HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [RFC 7232: HTTP Conditional Requests](https://tools.ietf.org/html/rfc7232)
- [Web.dev: HTTP Caching](https://web.dev/http-cache/)

## Contact

For questions about the client-side caching implementation, refer to:
- **File**: `onesign-login-portal/lib/tenant-branding.ts`
- **Key Functions**: `getTenantBranding()`, `fetchBrandingFromAPI()`
