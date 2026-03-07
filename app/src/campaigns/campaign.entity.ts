import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { User } from 'src/users/user.entity';
import { Contact } from 'src/contacts/contact.entity';
import { CommunicationChannel } from 'src/commom/enums/communication-channel.enum';
import { CampaignStatus } from './enums/campaign-status.enum';

@Entity()
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: CommunicationChannel,
  })
  channelType: CommunicationChannel;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @ManyToOne(() => User, (user) => user.campaigns)
  user: User;

  @ManyToMany(() => Contact, (contact) => contact.campaigns)
  @JoinTable()
  contacts: Contact[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
