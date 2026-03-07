import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from 'typeorm';

import { Campaign } from 'src/campaigns/campaign.entity';
import { User } from 'src/users/user.entity';
import { ContactChannel } from 'src/contact-channel/contact-channel.entity';

@Entity()
@Unique(['name', 'user'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => ContactChannel, (contactChannel) => contactChannel.contact)
  contactChannels: ContactChannel[];

  @ManyToOne(() => User, (user) => user.contacts)
  user: User;

  @ManyToMany(() => Campaign, (campaign) => campaign.contacts)
  campaigns: Campaign[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
