import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Contact } from './contact.entity';
import { User } from 'src/users/user.entity';
import { ContactChannel } from 'src/contact-channel/contact-channel.entity';

import { ContactsService } from './contacts.service';
import { ContactsResolver } from './contacts.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Contact, User, ContactChannel])],
  providers: [ContactsService, ContactsResolver],
})
export class ContactsModule {}
