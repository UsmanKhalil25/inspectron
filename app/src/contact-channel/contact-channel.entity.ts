import { Contact } from 'src/contacts/contact.entity';
import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { CommunicationChannel } from 'src/commom/enums/communication-channel.enum';

@Entity()
@Unique(['type', 'value'])
export class ContactChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CommunicationChannel,
  })
  type: CommunicationChannel;

  @Column()
  value: string;

  @ManyToOne(() => Contact, (contact) => contact.contactChannels)
  contact: Contact;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
