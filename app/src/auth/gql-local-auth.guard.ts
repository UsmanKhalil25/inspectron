import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginUserInput } from './inputs/login-user.input';
import { Request } from 'express';
import { PublicUser } from 'src/users/types/public-user.type';

@Injectable()
export class GqlLocalAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<{
      req: Request & { user?: PublicUser };
    }>();
    const args = gqlContext.getArgs<{ input: LoginUserInput }>();

    const { email, password } = args.input;

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    ctx.req.user = user;
    return true;
  }
}
