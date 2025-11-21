import { ApiError, NetworkError, ValidationError, AuthenticationError, AuthorizationError } from './errors/api-errors';
import { buildQueryString } from './utils/query-builder';

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onResponse?: (response: Response) => Response | Promise<Response>;
  onError?: (error: ApiError) => void | Promise<void>;
}

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
  tenantId?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

export class ApiClient {
  private config: ApiClientConfig;
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];
  private errorInterceptors: Array<(error: ApiError) => void | Promise<void>> = [];

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    if (config.onRequest) {
      this.requestInterceptors.push(config.onRequest);
    }
    if (config.onResponse) {
      this.responseInterceptors.push(config.onResponse);
    }
    if (config.onError) {
      this.errorInterceptors.push(config.onError);
    }
  }

  /**
   * Add a request interceptor
   */
  public addRequestInterceptor(
    interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  ): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   */
  public addResponseInterceptor(
    interceptor: (response: Response) => Response | Promise<Response>
  ): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add an error interceptor
   */
  public addErrorInterceptor(interceptor: (error: ApiError) => void | Promise<void>): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Main request method
   */
  public async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      // Apply request interceptors
      let requestConfig = { ...config };
      for (const interceptor of this.requestInterceptors) {
        requestConfig = await interceptor(requestConfig);
      }

      // Build URL with query parameters
      const url = this.buildUrl(requestConfig.url, requestConfig.params);

      // Build headers
      const headers = this.buildHeaders(requestConfig);

      // Build fetch options
      const fetchOptions: RequestInit = {
        method: requestConfig.method,
        headers,
        signal: this.createAbortSignal(requestConfig.timeout || this.config.timeout!),
      };

      // Add body for non-GET requests
      if (requestConfig.body && requestConfig.method !== 'GET') {
        fetchOptions.body = JSON.stringify(requestConfig.body);
      }

      // Make the request
      let response = await fetch(url, fetchOptions);

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      // Handle errors
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Parse response
      const data = await this.parseResponse<T>(response);

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      // Handle network errors and other exceptions
      const apiError = this.createApiError(error);

      // Apply error interceptors
      for (const interceptor of this.errorInterceptors) {
        await interceptor(apiError);
      }

      throw apiError;
    }
  }

  /**
   * GET request
   */
  public async get<T = any>(url: string, params?: Record<string, any>, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'GET',
      params,
    });
  }

  /**
   * POST request
   */
  public async post<T = any>(url: string, body?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'POST',
      body,
    });
  }

  /**
   * PUT request
   */
  public async put<T = any>(url: string, body?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PUT',
      body,
    });
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(url: string, body?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PATCH',
      body,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'DELETE',
    });
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, any>): string {
    const baseUrl = this.config.baseUrl.endsWith('/')
      ? this.config.baseUrl.slice(0, -1)
      : this.config.baseUrl;

    const url = path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;

    if (params && Object.keys(params).length > 0) {
      return `${url}?${buildQueryString(params)}`;
    }

    return url;
  }

  /**
   * Build request headers
   */
  private buildHeaders(config: RequestConfig): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.defaultHeaders,
      ...config.headers,
    };

    // Add tenant context if provided
    if (config.tenantId) {
      headers['X-Tenant-Id'] = config.tenantId;
    }

    return headers;
  }

  /**
   * Create abort signal for timeout
   */
  private createAbortSignal(timeout: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    if (contentType?.includes('text/')) {
      return response.text() as any;
    }

    return response.blob() as any;
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;

    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const message = errorData.message || errorData.error || response.statusText;
    const code = errorData.code || `HTTP_${response.status}`;

    switch (response.status) {
      case 400:
        throw new ValidationError(message, code, errorData);
      case 401:
        throw new AuthenticationError(message, code, errorData);
      case 403:
        throw new AuthorizationError(message, code, errorData);
      default:
        throw new ApiError(message, code, response.status, errorData);
    }
  }

  /**
   * Create API error from exception
   */
  private createApiError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error.name === 'AbortError') {
      return new NetworkError('Request timeout', 'TIMEOUT');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new NetworkError('Network error', 'NETWORK_ERROR');
    }

    return new ApiError(
      error.message || 'Unknown error',
      'UNKNOWN_ERROR',
      0,
      error
    );
  }
}

// Default instance with localhost configuration
export const apiClient = new ApiClient({
  baseUrl: 'http://localhost:7000',
  timeout: 30000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
});

// Create a custom instance
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
