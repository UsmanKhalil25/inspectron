import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LoginUserInput } from './inputs/login-user.input';
import { RegisterUserInput } from './inputs/register-user.input';
import { LoginResponse } from './types/login-response.type';
import { RegisterResponse } from './types/register-response.type';
import { PublicUser } from 'src/users/types/public-user.type';
import { GqlLocalAuthGuard } from './gql-local-auth.guard';

import { parseDurationToMs } from 'src/commom/utils/time.util';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Mutation(() => LoginResponse)
  @UseGuards(GqlLocalAuthGuard)
  async login(
    @Args('input') _loginUserInput: LoginUserInput,

    @Context() context: { req: { user: PublicUser }; res: Response },
  ): Promise<LoginResponse> {
    const { accessToken } = await this.authService.login(context.req.user);

    const jwtExpiresIn =
      this.configService.get<string>('auth.jwtExpiresIn') || '1d';
    const cookieName = 'auth-token';
    const maxAge = parseDurationToMs(jwtExpiresIn);
    const validPath = '/';
    const nodeEnv =
      this.configService.get<string>('app.nodeEnv') || 'development';
    const isProd = nodeEnv === 'production';
    const sameSite: 'lax' | 'strict' | 'none' = isProd ? 'none' : 'lax';

    context.res.cookie(cookieName, accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite,
      maxAge,
      path: validPath,
    });

    return {
      message: 'Login successful',
      user: context.req.user,
    };
  }

  @Mutation(() => RegisterResponse)
  async register(
    @Args('input') registerUserInput: RegisterUserInput,
  ): Promise<RegisterResponse> {
    if (registerUserInput.password !== registerUserInput.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const { confirmPassword: _, ...userData } = registerUserInput;
    const user = await this.userService.createUser(userData);

    return {
      message: 'User created successfully',
      data: user,
    };
  }
}
