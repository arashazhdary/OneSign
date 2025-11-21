/**
 * Base API Error class
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly data?: any;
  public readonly timestamp: Date;

  constructor(message: string, code: string, statusCode: number = 0, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Check if error is of a specific type
   */
  public isType(errorType: typeof ApiError): boolean {
    return this instanceof errorType;
  }

  /**
   * Convert error to plain object
   */
  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      data: this.data,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Network Error - Connection issues, timeout, etc.
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred', code: string = 'NETWORK_ERROR', data?: any) {
    super(message, code, 0, data);
    this.name = 'NetworkError';
  }
}

/**
 * Validation Error - Invalid request data (400)
 */
export class ValidationError extends ApiError {
  public readonly validationErrors?: Record<string, string[]>;

  constructor(message: string = 'Validation failed', code: string = 'VALIDATION_ERROR', data?: any) {
    super(message, code, 400, data);
    this.name = 'ValidationError';
    this.validationErrors = data?.validationErrors || data?.errors;
  }

  /**
   * Get validation errors for a specific field
   */
  public getFieldErrors(field: string): string[] | undefined {
    return this.validationErrors?.[field];
  }

  /**
   * Check if field has validation errors
   */
  public hasFieldError(field: string): boolean {
    return !!this.validationErrors?.[field];
  }
}

/**
 * Authentication Error - Not authenticated (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required', code: string = 'AUTHENTICATION_ERROR', data?: any) {
    super(message, code, 401, data);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error - Not authorized (403)
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access forbidden', code: string = 'AUTHORIZATION_ERROR', data?: any) {
    super(message, code, 403, data);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(
    message: string = 'Resource not found',
    code: string = 'NOT_FOUND',
    resourceType?: string,
    resourceId?: string,
    data?: any
  ) {
    super(message, code, 404, data);
    this.name = 'NotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Conflict Error - Resource conflict (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict', code: string = 'CONFLICT_ERROR', data?: any) {
    super(message, code, 409, data);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error - Too many requests (429)
 */
export class RateLimitError extends ApiError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', code: string = 'RATE_LIMIT_ERROR', retryAfter?: number, data?: any) {
    super(message, code, 429, data);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Server Error - Internal server error (500+)
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error', code: string = 'SERVER_ERROR', statusCode: number = 500, data?: any) {
    super(message, code, statusCode, data);
    this.name = 'ServerError';
  }
}

/**
 * Business Logic Error - Application-specific errors
 */
export class BusinessError extends ApiError {
  constructor(message: string, code: string, data?: any) {
    super(message, code, 422, data);
    this.name = 'BusinessError';
  }
}

/**
 * Error codes enum
 */
export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // Client errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_PARAMETER = 'MISSING_PARAMETER',
  INVALID_PARAMETER = 'INVALID_PARAMETER',

  // Authentication errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Authorization errors
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',

  // Rate limiting
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Business logic errors
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  OPERATION_FAILED = 'OPERATION_FAILED',
  INVALID_STATE = 'INVALID_STATE',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Handle API error and return user-friendly message
   */
  public static getUserMessage(error: ApiError): string {
    if (error instanceof ValidationError) {
      return 'Please check your input and try again.';
    }

    if (error instanceof AuthenticationError) {
      return 'Please sign in to continue.';
    }

    if (error instanceof AuthorizationError) {
      return 'You do not have permission to perform this action.';
    }

    if (error instanceof NotFoundError) {
      return 'The requested resource was not found.';
    }

    if (error instanceof ConflictError) {
      return 'This resource already exists or conflicts with existing data.';
    }

    if (error instanceof RateLimitError) {
      return 'Too many requests. Please try again later.';
    }

    if (error instanceof NetworkError) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (error instanceof ServerError) {
      return 'An error occurred on the server. Please try again later.';
    }

    return error.message || 'An unexpected error occurred.';
  }

  /**
   * Check if error is retryable
   */
  public static isRetryable(error: ApiError): boolean {
    return (
      error instanceof NetworkError ||
      error instanceof RateLimitError ||
      (error instanceof ServerError && error.statusCode >= 500)
    );
  }

  /**
   * Log error with context
   */
  public static log(error: ApiError, context?: Record<string, any>): void {
    console.error('[API Error]', {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      context,
      stack: error.stack,
    });
  }
}
