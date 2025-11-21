import { ValidationError } from '../errors/api-errors';

/**
 * Validate response data structure
 */
export function validateResponse<T>(
  data: any,
  validator: (data: any) => boolean,
  errorMessage: string = 'Invalid response data'
): T {
  if (!validator(data)) {
    throw new ValidationError(errorMessage, 'INVALID_RESPONSE_DATA', { data });
  }
  return data as T;
}

/**
 * Validate required fields
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  fields: Array<keyof T>
): void {
  const missingFields = fields.filter((field) => data[field] === undefined || data[field] === null);

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      'MISSING_REQUIRED_FIELDS',
      { missingFields }
    );
  }
}

/**
 * Validate array response
 */
export function validateArrayResponse<T>(data: any, itemValidator?: (item: any) => boolean): T[] {
  if (!Array.isArray(data)) {
    throw new ValidationError('Expected array response', 'INVALID_RESPONSE_TYPE', { data });
  }

  if (itemValidator) {
    const invalidItems = data.filter((item, index) => !itemValidator(item));
    if (invalidItems.length > 0) {
      throw new ValidationError(
        'Invalid items in array response',
        'INVALID_ARRAY_ITEMS',
        { invalidItems }
      );
    }
  }

  return data as T[];
}

/**
 * Validate paginated response
 */
export function validatePaginatedResponse<T>(data: any): {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
} {
  validateRequiredFields(data, ['items', 'totalCount', 'page', 'pageSize']);

  if (!Array.isArray(data.items)) {
    throw new ValidationError('Items must be an array', 'INVALID_ITEMS_TYPE', { data });
  }

  if (typeof data.totalCount !== 'number') {
    throw new ValidationError('Total count must be a number', 'INVALID_TOTAL_COUNT_TYPE', { data });
  }

  return data;
}

/**
 * Type guards
 */
export const typeGuards = {
  isString: (value: any): value is string => typeof value === 'string',
  isNumber: (value: any): value is number => typeof value === 'number',
  isBoolean: (value: any): value is boolean => typeof value === 'boolean',
  isArray: (value: any): value is any[] => Array.isArray(value),
  isObject: (value: any): value is object => typeof value === 'object' && value !== null && !Array.isArray(value),
  isDate: (value: any): value is Date => value instanceof Date,
  isNull: (value: any): value is null => value === null,
  isUndefined: (value: any): value is undefined => value === undefined,
  isNullOrUndefined: (value: any): value is null | undefined => value === null || value === undefined,
};
