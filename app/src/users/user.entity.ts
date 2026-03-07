import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Campaign } from 'src/campaigns/campaign.entity';
import { Contact } from 'src/contacts/contact.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @OneToMany(() => Campaign, (campaign) => campaign.user)
  campaigns: Campaign[];

  @OneToMany(() => Contact, (contact) => contact.user)
  contacts: Contact[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
