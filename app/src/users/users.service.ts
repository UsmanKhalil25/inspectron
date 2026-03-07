import {
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';

import { User } from './user.entity';
import { UserCreateParams } from './interfaces/user-create-params.interface';
import { FindUserOptions } from './interfaces/find-user-options.interface';
import { PublicUser } from './types/public-user.type';
@Injectable()
export class UsersService {
  private readonly allFields: (keyof User)[] = [
    'id',
    'email',
    'name',
    'password',
    'lastLoginAt',
    'createdAt',
    'updatedAt',
  ];

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(params: UserCreateParams): Promise<PublicUser> {
    const existingUser = await this.findByEmail(params.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await hash(params.password, 10);

    const user = this.userRepository.create({
      ...params,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    // Remove password before returning
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }

  private async findOneBy<K extends keyof User>(
    where: Pick<User, K>,
    options: FindUserOptions = {},
  ): Promise<User | null> {
    if (!options.exclude || options.exclude.length === 0) {
      return this.userRepository.findOne({ where });
    }

    const fieldsToSelect = this.allFields.filter(
      (field) => !options.exclude!.includes(field),
    );
    const select: Record<string, boolean> = {};
    for (const field of fieldsToSelect) {
      select[field] = true;
    }

    return this.userRepository.findOne({
      where,
      select,
    });
  }

  async findByEmail(
    email: string,
    options: FindUserOptions = {},
  ): Promise<User | null> {
    return await this.findOneBy({ email }, options);
  }

  async findById(
    id: string,
    options: FindUserOptions = {},
  ): Promise<User | null> {
    return await this.findOneBy({ id }, options);
  }

  async updateLastLoginAt(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
  }
}
