/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          searchParams.append(key, String(item));
        });
      } else if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, any> {
  const params: Record<string, any> = {};
  const searchParams = new URLSearchParams(queryString);

  searchParams.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key].push(parseValue(value));
      } else {
        params[key] = [params[key], parseValue(value)];
      }
    } else {
      params[key] = parseValue(value);
    }
  });

  return params;
}

/**
 * Parse value to appropriate type
 */
function parseValue(value: string): any {
  // Try to parse as JSON
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  // Parse boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Parse number
  if (!isNaN(Number(value)) && value !== '') {
    return Number(value);
  }

  return value;
}

/**
 * Build URL with path parameters
 */
export function buildUrlWithParams(url: string, params: Record<string, string | number>): string {
  let result = url;

  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
    result = result.replace(`{${key}}`, String(value));
  });

  return result;
}

/**
 * Merge query parameters
 */
export function mergeQueryParams(
  ...params: Array<Record<string, any> | undefined>
): Record<string, any> {
  return params.reduce((acc, current) => {
    if (!current) return acc;
    return { ...acc, ...current };
  }, {});
}
