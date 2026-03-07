import { Query, Resolver, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { User } from './types/user.type';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../commom/interfaces/jwt-payload.interface';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async currentUser(
    @Context() context: { req: { user: JwtPayload } },
  ): Promise<User | null> {
    const user = context.req.user;
    return await this.usersService.findById(user.sub);
  }
}
