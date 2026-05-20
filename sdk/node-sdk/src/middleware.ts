import type { NextFunction, Request, Response } from 'express';
import type { OnesignAuthConfig } from './types';
import { validateOnesignToken } from './validateToken';

export interface OnesignAuthenticatedRequest extends Request {
  user?: import('./types').OnesignUser;
}

/**
 * Express middleware that validates `Authorization: Bearer` tokens from OneSign.
 */
export function createOnesignAuthMiddleware(config: OnesignAuthConfig) {
  return async (req: OnesignAuthenticatedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized', message: 'Missing Bearer token' });
      return;
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      res.status(401).json({ error: 'Unauthorized', message: 'Empty Bearer token' });
      return;
    }

    try {
      req.user = await validateOnesignToken(token, config);
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid token';
      res.status(401).json({ error: 'Unauthorized', message });
    }
  };
}
