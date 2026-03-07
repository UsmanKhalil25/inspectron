import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  FindOptionsWhere,
  ILike,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';

import { Contact } from './contact.entity';
import { ContactChannel } from 'src/contact-channel/contact-channel.entity';
import { User } from 'src/users/user.entity';
import { CreateContactInput } from './inputs/create-contact.input';
import { BulkCreateContactInput } from './inputs/bulk-create-contact.input';
import { BulkCreateContactResponse } from './types/bulk-create-contact-response.type';
import { PaginationArgs } from 'src/commom/inputs/pagination-args.input';
import { ContactFilterInput } from './inputs/contact-filter.input';
import { isValidDateString } from 'src/commom/utils/date.utils';
import { ContactSortBy } from './enums/contact-sort-by.enum';
import { SortOrder } from 'src/commom/enums/sort-order.enum';
import { ContactsResponse } from './types/contacts-response.type';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(ContactChannel)
    private readonly contactChannelsRepository: Repository<ContactChannel>,
  ) {}

  async findById(contactId: string, userId: string): Promise<Contact> {
    if (!contactId) {
      throw new BadRequestException('Contact id is required');
    }

    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const contact = await this.contactsRepository.findOne({
        where: {
          id: contactId,
          user: { id: userId },
        },
        relations: ['contactChannels'],
      });

      if (!contact) {
        throw new NotFoundException(
          `Contact with ID ${contactId} not found or you don't have permission to access it`,
        );
      }

      return contact;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve contact',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findMany(
    userId: string,
    paginationArgs: PaginationArgs,
    filters?: ContactFilterInput,
  ): Promise<ContactsResponse> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page = 1, limit = 10 } = paginationArgs;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Contact> = {
      user: { id: userId },
    };

    if (filters) {
      const { search, createdAfter, createdBefore } = filters;

      if (search) {
        where.name = ILike(`%${search}%`);
      }

      if (createdAfter && !isValidDateString(createdAfter)) {
        throw new BadRequestException('Invalid createdAfter date');
      }

      if (createdBefore && !isValidDateString(createdBefore)) {
        throw new BadRequestException('Invalid createdBefore date');
      }

      if (createdAfter && createdBefore) {
        where.createdAt = Between(
          new Date(createdAfter),
          new Date(createdBefore),
        );
      } else if (createdAfter) {
        where.createdAt = MoreThanOrEqual(new Date(createdAfter));
      } else if (createdBefore) {
        where.createdAt = LessThanOrEqual(new Date(createdBefore));
      }
    }

    const sortFieldMap: Record<ContactSortBy, keyof Contact> = {
      [ContactSortBy.CREATED_AT]: 'createdAt',
      [ContactSortBy.UPDATED_AT]: 'updatedAt',
      [ContactSortBy.NAME]: 'name',
    };

    const sortBy: ContactSortBy =
      filters?.sortBy && Object.values(ContactSortBy).includes(filters.sortBy)
        ? filters.sortBy
        : ContactSortBy.CREATED_AT;

    const sortOrder: SortOrder =
      filters?.sortOrder && Object.values(SortOrder).includes(filters.sortOrder)
        ? filters.sortOrder
        : SortOrder.DESC;

    const order: Record<string, 'asc' | 'desc'> = {
      [sortFieldMap[sortBy]]: sortOrder,
    };

    const [contacts, total] = await this.contactsRepository.findAndCount({
      where,
      relations: ['contactChannels'],
      order,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async createContact(
    input: CreateContactInput,
    userId: string,
  ): Promise<Contact> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingContact = await this.contactsRepository.findOne({
      where: { name: input.name, user: { id: userId } },
      relations: ['contactChannels'],
    });

    if (existingContact) {
      for (const newChannel of input.contactChannels) {
        const conflictingChannel = existingContact.contactChannels.find(
          (existing) =>
            existing.type === newChannel.type &&
            existing.value === newChannel.value,
        );
        if (conflictingChannel) {
          throw new ConflictException(
            `Contact with name "${input.name}" already has ${newChannel.type}: ${newChannel.value}`,
          );
        }
      }
    }

    if (input.contactChannels && input.contactChannels.length > 0) {
      for (const channel of input.contactChannels) {
        const existingChannel = await this.contactChannelsRepository.findOne({
          where: { type: channel.type, value: channel.value },
        });
        if (existingChannel) {
          throw new ConflictException(
            `${channel.type} "${channel.value}" is already in use`,
          );
        }
      }
    }

    return await this.contactsRepository.manager.transaction(
      async (manager) => {
        const contact = manager.create(Contact, {
          name: input.name,
          user,
        });
        const savedContact = await manager.save(Contact, contact);
        let savedContactChannels: ContactChannel[] = [];
        if (input.contactChannels && input.contactChannels.length > 0) {
          const contactChannels = input.contactChannels.map((channel) =>
            manager.create(ContactChannel, {
              ...channel,
              contact: savedContact,
            }),
          );
          savedContactChannels = await manager.save(
            ContactChannel,
            contactChannels,
          );
        }
        savedContact.contactChannels = savedContactChannels;
        return savedContact;
      },
    );
  }

  async bulkCreateContacts(input: BulkCreateContactInput, userId: string) {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    if (!input.contacts || input.contacts.length === 0) {
      throw new BadRequestException('No contacts provided');
    }

    if (input.contacts.length > 1000) {
      throw new BadRequestException('Maximum 1000 contacts allowed per batch');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result: BulkCreateContactResponse = {
      created: [],
      errors: [],
      summary: {
        total: input.contacts.length,
        successful: 0,
        failed: 0,
      },
    };

    return await this.contactsRepository.manager.transaction(
      async (manager) => {
        const inputContactNames = input.contacts.map((contact) => contact.name);
        const inputContactChannels = input.contacts.flatMap(
          (contact) => contact.contactChannels || [],
        );

        const existingContacts = await manager.find(Contact, {
          where: {
            name:
              inputContactNames.length > 0 ? In(inputContactNames) : undefined,
            user: { id: userId },
          },
          relations: ['contactChannels'],
        });

        const existingContactsMap = new Map(
          existingContacts.map((contact) => [
            `${contact.name}-${userId}`,
            contact,
          ]),
        );

        let existingChannelsMap = new Map();

        if (inputContactChannels.length > 0) {
          const contactChannelQueries = inputContactChannels.map(
            (contactChannels) => ({
              type: contactChannels.type,
              value: contactChannels.value,
            }),
          );

          const existingContatChannel = await manager.find(ContactChannel, {
            where: contactChannelQueries,
          });

          existingChannelsMap = new Map(
            existingContatChannel.map((contactChannel) => [
              `${contactChannel.type}-${contactChannel.value}`,
              contactChannel,
            ]),
          );
        }

        const validContacts: Array<{
          index: number;
          input: CreateContactInput;
        }> = [];

        for (let index = 0; index < input.contacts.length; index++) {
          const contact = input.contacts[index];

          const existingContact = existingContactsMap.get(
            `${contact.name}-${userId}`,
          );

          if (existingContact) {
            const hasConflict = contact.contactChannels?.some(
              (newContactChannel) =>
                existingContact.contactChannels.some(
                  (existingContactChannel) =>
                    newContactChannel.type === existingContactChannel.type &&
                    newContactChannel.value === existingContactChannel.value,
                ),
            );
            if (hasConflict) {
              result.errors.push({
                index,
                error: `Contact "${contact.name}" already exists with conflicting channels`,
              });
              continue;
            }
          }

          const conflictingChannel = contact.contactChannels?.find(
            (contactChannel) =>
              existingChannelsMap.has(
                `${contactChannel.type}-${contactChannel.value}`,
              ),
          );
          if (conflictingChannel) {
            result.errors.push({
              index,
              error: `${conflictingChannel.type} "${conflictingChannel.value}" is already in use`,
            });
            continue;
          }

          const duplicateInBatch = validContacts.find(
            (validContact) =>
              validContact.input.name === contact.name ||
              validContact.input.contactChannels?.some((validContactChannel) =>
                contact.contactChannels?.some(
                  (newContactChannel) =>
                    validContactChannel.type === newContactChannel.type &&
                    validContactChannel.value === newContactChannel.value,
                ),
              ),
          );

          if (duplicateInBatch) {
            result.errors.push({
              index,
              error: `Duplicate contact or channel found within batch`,
            });
            continue;
          }

          validContacts.push({
            index,
            input: contact,
          });

          contact.contactChannels?.forEach((contactChannel) => {
            existingChannelsMap.set(
              `${contactChannel.type}-${contactChannel.value}`,
              true,
            );
          });
        }

        if (validContacts.length > 0) {
          const contactsToCreate = validContacts.map((validContact) =>
            manager.create(Contact, {
              name: validContact.input.name,
              user,
            }),
          );

          const savedContacts = await manager.save(Contact, contactsToCreate);

          const allChannelsToCreate: Partial<ContactChannel>[] = [];

          validContacts.forEach((validContact, contactIndex) => {
            const savedContact = savedContacts[contactIndex];
            const channelsForContact =
              validContact.input.contactChannels?.map((channel) => ({
                type: channel.type,
                value: channel.value,
                contact: savedContact,
              })) || [];
            allChannelsToCreate.push(...channelsForContact);
          });

          let savedChannels: ContactChannel[] = [];
          if (allChannelsToCreate.length > 0) {
            const channelsToSave = allChannelsToCreate.map((channel) =>
              manager.create(ContactChannel, channel),
            );
            savedChannels = await manager.save(ContactChannel, channelsToSave);
          }

          let channelIndex = 0;
          for (let i = 0; i < validContacts.length; i++) {
            const savedContact = savedContacts[i];
            const channelCount =
              validContacts[i].input.contactChannels?.length || 0;

            savedContact.contactChannels = savedChannels.slice(
              channelIndex,
              channelIndex + channelCount,
            );

            channelIndex += channelCount;
            result.created.push(savedContact);
          }
        }

        result.summary.successful = result.created.length;
        result.summary.failed = result.errors.length;

        return result;
      },
    );
  }
}
