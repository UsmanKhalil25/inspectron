import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { JwtPayload } from '../commom/interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return ctx.getContext().req;
  }

  handleRequest<TUser = JwtPayload>(
    err: any,
    user: TUser,
    _info: any,
    _context: ExecutionContext,
    _status?: any,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
