import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  ILike,
  FindOptionsWhere,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';

import { SortOrder } from 'src/commom/enums/sort-order.enum';
import { CampaignSortBy } from './enums/campaign-sort-by.enum';
import { CampaignStatus } from './enums/campaign-status.enum';
import { CreateCampaignInput } from './inputs/create-campaign.input';
import { Campaign } from './campaign.entity';
import { Contact } from 'src/contacts/contact.entity';
import { User } from 'src/users/user.entity';

import { AddContactsToCampaignInput } from './inputs/add-contacts-to-campaign.input';
import { PaginationArgs } from 'src/commom/inputs/pagination-args.input';
import { CampaignFiltersInput } from './inputs/campaign-filters.input';
import { CampaignsResponse } from './types/campaigns-response.type';
import { isValidDateString } from 'src/commom/utils/date.utils';
import { CampaignStats } from './types/campaign-stats.type';
import { CommunicationChannel } from 'src/commom/enums/communication-channel.enum';

const CREATABLE_CAMPAIGN_STATUSES = [
  CampaignStatus.DRAFT,
  CampaignStatus.QUEUED,
];

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignsRepository: Repository<Campaign>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createCampaign(
    input: CreateCampaignInput,
    userId: string,
  ): Promise<Campaign> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    if (!input.title?.trim()) {
      throw new BadRequestException('Campaign title is required');
    }

    if (!input.description.trim()) {
      throw new BadRequestException('Campaign description is required');
    }

    if (input.status && !CREATABLE_CAMPAIGN_STATUSES.includes(input.status)) {
      throw new BadRequestException(
        `Invalid status "${input.status}" for campaign creation. Only "draft" and "queued" are allowed.`,
      );
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.campaignsRepository.manager.transaction(
      async (manager) => {
        try {
          const campaign = manager.create(Campaign, {
            title: input.title.trim(),
            description: input.description?.trim(),
            channelType: input.channelType,
            status: input.status ?? CampaignStatus.DRAFT,
            user,
          });

          const savedCampaign = await manager.save(campaign);

          const campaignWithRelations = await manager.findOne(Campaign, {
            where: { id: savedCampaign.id },
            relations: ['user', 'contacts', 'contacts.contactChannels'],
          });

          if (!campaignWithRelations) {
            throw new InternalServerErrorException(
              'Failed to reload campaign with relations',
            );
          }

          return campaignWithRelations;
        } catch (error) {
          if (
            error instanceof NotFoundException ||
            error instanceof BadRequestException
          ) {
            throw error;
          }

          throw new InternalServerErrorException(
            'Failed to create campaign',
            error instanceof Error ? error.message : String(error),
          );
        }
      },
    );
  }

  async findMany(
    userId: string,
    paginationArgs: PaginationArgs,
    filters?: CampaignFiltersInput,
  ): Promise<CampaignsResponse> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page = 1, limit = 10 } = paginationArgs;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Campaign> = {
      user: { id: userId },
    };
    if (filters) {
      const { status, search, createdAfter, createdBefore } = filters;

      if (status) {
        where.status = status;
      }

      if (search) {
        where.title = ILike(`%${search}%`);
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
    const sortFieldMap: Record<CampaignSortBy, keyof Campaign> = {
      [CampaignSortBy.CREATED_AT]: 'createdAt',
      [CampaignSortBy.UPDATED_AT]: 'updatedAt',
      [CampaignSortBy.NAME]: 'title',
      [CampaignSortBy.STATUS]: 'status',
    };
    const sortBy: CampaignSortBy =
      filters?.sortBy && Object.values(CampaignSortBy).includes(filters.sortBy)
        ? filters.sortBy
        : CampaignSortBy.CREATED_AT;

    const sortOrder: SortOrder =
      filters?.sortOrder && Object.values(SortOrder).includes(filters.sortOrder)
        ? filters.sortOrder
        : SortOrder.DESC;

    const order: Record<string, 'asc' | 'desc'> = {
      [sortFieldMap[sortBy]]: sortOrder,
    };

    const [campaigns, total] = await this.campaignsRepository.findAndCount({
      where,
      relations: ['user', 'contacts', 'contacts.contactChannels'],
      order,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      campaigns,
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

  async findById(campaignId: string, userId: string): Promise<Campaign> {
    if (!campaignId) {
      throw new BadRequestException('Campaign id is required');
    }

    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const campaign = await this.campaignsRepository.findOne({
        where: {
          id: campaignId,
          user: { id: userId },
        },
        relations: ['user', 'contacts', 'contacts.contactChannels'],
      });

      if (!campaign) {
        throw new NotFoundException(
          `Campaign with ID ${campaignId} not found or you don't have permission to access it`,
        );
      }

      return campaign;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve campaign',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async addContacts(
    input: AddContactsToCampaignInput,
    userId: string,
  ): Promise<Campaign> {
    const { campaignId, contactIds } = input;

    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    if (!campaignId) {
      throw new BadRequestException('Campaign id is required');
    }

    if (!contactIds.length) {
      throw new BadRequestException('At least one contact id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.campaignsRepository.manager.transaction(
      async (manager) => {
        try {
          const campaign = await manager.findOne(Campaign, {
            where: { id: campaignId, user: { id: userId } },
            relations: ['contacts', 'user'],
          });

          if (!campaign) {
            throw new NotFoundException(
              'Campaign not found or not accessible by user',
            );
          }

          const contacts = await manager.find(Contact, {
            where: { id: In(contactIds) },
            relations: ['contactChannels'],
          });

          if (contacts.length !== contactIds.length) {
            throw new NotFoundException('Some contacts were not found');
          }

          const existingIds = new Set(campaign.contacts.map((c) => c.id));
          const newContacts = contacts.filter((c) => !existingIds.has(c.id));

          campaign.contacts = [...campaign.contacts, ...newContacts];

          const savedCampaign = await manager.save(campaign);

          const campaignWithRelations = await manager.findOne(Campaign, {
            where: { id: savedCampaign.id },
            relations: ['user', 'contacts', 'contacts.contactChannels'],
          });

          if (!campaignWithRelations) {
            throw new InternalServerErrorException(
              'Failed to reload campaign with relations',
            );
          }

          return campaignWithRelations;
        } catch (error) {
          if (
            error instanceof NotFoundException ||
            error instanceof BadRequestException
          ) {
            throw error;
          }

          throw new InternalServerErrorException(
            'Failed to associate contacts with campaign',
            error instanceof Error ? error.message : String(error),
          );
        }
      },
    );
  }

  async getCampaignsStats(userId: string): Promise<CampaignStats> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const results = await this.campaignsRepository
        .createQueryBuilder('campaign')
        .select([
          'COUNT(*) AS "totalCampaigns"',
          `SUM(CASE WHEN campaign.status = '${CampaignStatus.DRAFT}' THEN 1 ELSE 0 END) AS "draftCount"`,
          `SUM(CASE WHEN campaign.status = '${CampaignStatus.QUEUED}' THEN 1 ELSE 0 END) AS "queuedCount"`,
          `SUM(CASE WHEN campaign.status = '${CampaignStatus.ACTIVE}' THEN 1 ELSE 0 END) AS "activeCount"`,
          `SUM(CASE WHEN campaign.status = '${CampaignStatus.COMPLETED}' THEN 1 ELSE 0 END) AS "completedCount"`,
          `SUM(CASE WHEN campaign.status = '${CampaignStatus.FAILED}' THEN 1 ELSE 0 END) AS "failedCount"`,
          `SUM(CASE WHEN campaign.channelType = '${CommunicationChannel.EMAIL}' THEN 1 ELSE 0 END) AS "emailCount"`,
          `SUM(CASE WHEN campaign.channelType = '${CommunicationChannel.SMS}' THEN 1 ELSE 0 END) AS "smsCount"`,
        ])
        .where('campaign.userId = :userId', { userId })
        .getRawOne<{
          totalCampaigns: string;
          draftCount: string;
          queuedCount: string;
          activeCount: string;
          completedCount: string;
          failedCount: string;
          emailCount: string;
          smsCount: string;
        }>();

      return {
        totalCampaigns: Number(results?.totalCampaigns) || 0,
        campaignsByStatus: {
          draft: Number(results?.draftCount) || 0,
          queued: Number(results?.queuedCount) || 0,
          active: Number(results?.activeCount) || 0,
          completed: Number(results?.completedCount) || 0,
          failed: Number(results?.failedCount) || 0,
        },
        campaignsByChannel: {
          email: Number(results?.emailCount) || 0,
          sms: Number(results?.smsCount) || 0,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve campaign statistics',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
