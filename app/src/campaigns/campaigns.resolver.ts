import { Query, Mutation, Resolver, Context, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CampaignsService } from './campaigns.service';

import { AddContactsToCampaignInput } from './inputs/add-contacts-to-campaign.input';
import { PaginationArgs } from 'src/commom/inputs/pagination-args.input';
import { CampaignFiltersInput } from './inputs/campaign-filters.input';
import { CreateCampaignInput } from './inputs/create-campaign.input';

import { CampaignsResponse } from './types/campaigns-response.type';
import { Campaign } from './types/campaign.type';
import { CampaignStats } from './types/campaign-stats.type';

import { JwtPayload } from 'src/commom/interfaces/jwt-payload.interface';

@Resolver(() => Campaign)
export class CampaignsResolver {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Query(() => Campaign)
  @UseGuards(JwtAuthGuard)
  async campaign(
    @Args('id') id: string,
    @Context() context: { req: { user: JwtPayload } },
  ) {
    const userId = context.req.user.sub;
    return await this.campaignsService.findById(id, userId);
  }

  @Query(() => CampaignsResponse)
  @UseGuards(JwtAuthGuard)
  async campaigns(
    @Context() context: { req: { user: JwtPayload } },
    @Args() paginationArgs: PaginationArgs,
    @Args('filters', { nullable: true }) filters?: CampaignFiltersInput,
  ) {
    const userId = context.req.user.sub;
    return await this.campaignsService.findMany(
      userId,
      paginationArgs,
      filters,
    );
  }

  @Query(() => CampaignStats)
  @UseGuards(JwtAuthGuard)
  async campaignStats(@Context() context: { req: { user: JwtPayload } }) {
    const userId = context.req.user.sub;
    return await this.campaignsService.getCampaignsStats(userId);
  }

  @Mutation(() => Campaign)
  @UseGuards(JwtAuthGuard)
  async createCampaign(
    @Context() context: { req: { user: JwtPayload } },
    @Args('input') input: CreateCampaignInput,
  ) {
    const userId = context.req.user.sub;
    return await this.campaignsService.createCampaign(input, userId);
  }

  @Mutation(() => Campaign)
  @UseGuards(JwtAuthGuard)
  async addContactsToCampaign(
    @Context() context: { req: { user: JwtPayload } },
    @Args('input') input: AddContactsToCampaignInput,
  ) {
    const userId = context.req.user.sub;
    return await this.campaignsService.addContacts(input, userId);
  }
}
