import { User } from '../user.entity';

export interface FindUserOptions {
  exclude?: (keyof User)[];
}
