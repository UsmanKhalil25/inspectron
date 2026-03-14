import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

@Injectable()
export class AuthTokenMiddleware implements NestMiddleware {
  use(req: RequestWithCookies, _res: Response, next: NextFunction) {
    // Skip WebSocket upgrade requests
    if (req.headers['upgrade'] === 'websocket') {
      next();
      return;
    }

    const token = req.cookies?.['auth-token'];
    if (token) {
      req.headers['authorization'] = `Bearer ${token}`;
    }
    next();
  }
}
