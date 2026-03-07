import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { User } from 'src/users/user.entity';

@Entity()
export class Scan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  url: string;

  @ManyToOne(() => User, (user) => user.campaigns)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
