import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/users/users.service';
import { PublicUser } from 'src/users/types/public-user.type';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    plainPassword: string,
  ): Promise<PublicUser | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await compare(plainPassword, user.password);
    if (!isPasswordValid) return null;

    const { password: _, ...result } = user;
    return result as PublicUser;
  }

  async login(user: PublicUser) {
    const { id, email } = user;
    await this.userService.updateLastLoginAt(id);
    const accessToken = this.jwtService.sign({ sub: id, email });

    return {
      accessToken,
    };
  }
}
