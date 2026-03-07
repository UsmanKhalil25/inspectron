import { Query, Mutation, Resolver, Context, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateContactInput } from './inputs/create-contact.input';
import { JwtPayload } from 'src/commom/interfaces/jwt-payload.interface';
import { Contact } from './types/contact.type';
import { BulkCreateContactResponse } from './types/bulk-create-contact-response.type';
import { BulkCreateContactInput } from './inputs/bulk-create-contact.input';
import { PaginationArgs } from 'src/commom/inputs/pagination-args.input';
import { ContactFilterInput } from './inputs/contact-filter.input';
import { ContactsResponse } from './types/contacts-response.type';

@Resolver(() => Contact)
export class ContactsResolver {
  constructor(private readonly contactsService: ContactsService) {}

  @Query(() => Contact)
  @UseGuards(JwtAuthGuard)
  async contact(
    @Context() context: { req: { user: JwtPayload } },
    @Args('id') id: string,
  ) {
    const userId = context.req.user.sub;
    return await this.contactsService.findById(id, userId);
  }

  @Query(() => ContactsResponse)
  @UseGuards(JwtAuthGuard)
  async contacts(
    @Context() context: { req: { user: JwtPayload } },
    @Args() paginationArgs: PaginationArgs,
    @Args('filters', { nullable: true }) filters?: ContactFilterInput,
  ) {
    const userId = context.req.user.sub;
    return await this.contactsService.findMany(userId, paginationArgs, filters);
  }

  @Mutation(() => Contact)
  @UseGuards(JwtAuthGuard)
  async createContact(
    @Context() context: { req: { user: JwtPayload } },
    @Args('input') input: CreateContactInput,
  ) {
    const userId = context.req.user.sub;
    return await this.contactsService.createContact(input, userId);
  }

  @Mutation(() => BulkCreateContactResponse)
  @UseGuards(JwtAuthGuard)
  async bulkCreateContact(
    @Context() context: { req: { user: JwtPayload } },
    @Args('input') input: BulkCreateContactInput,
  ) {
    const userId = context.req.user.sub;
    return await this.contactsService.bulkCreateContacts(input, userId);
  }
}
