import { Query, Mutation, Resolver, Context, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScansService } from './scans.service';

import { CreateScanInput } from './inputs/create-scan.input';
import { ScanFiltersInput } from './inputs/scan-filters.input';
import { PaginationArgs } from 'src/commom/inputs/pagination-args.input';

import { ScansResponse } from './types/scans-response.type';
import { Scan } from './types/scan.type';
import { ScanStats } from './types/scan-stats.type';

import { JwtPayload } from 'src/commom/interfaces/jwt-payload.interface';

@Resolver(() => Scan)
export class ScansResolver {
  constructor(private readonly scansService: ScansService) {}

  @Query(() => Scan)
  @UseGuards(JwtAuthGuard)
  async scan(
    @Args('id') id: string,
    @Context() context: { req: { user: JwtPayload } },
  ) {
    const userId = context.req.user.sub;
    return await this.scansService.findById(id, userId);
  }

  @Query(() => ScansResponse)
  @UseGuards(JwtAuthGuard)
  async scans(
    @Context() context: { req: { user: JwtPayload } },
    @Args() paginationArgs: PaginationArgs,
    @Args('filters', { nullable: true }) filters?: ScanFiltersInput,
  ) {
    const userId = context.req.user.sub;
    return await this.scansService.findMany(userId, paginationArgs, filters);
  }

  @Query(() => ScanStats)
  @UseGuards(JwtAuthGuard)
  async scanStats(@Context() context: { req: { user: JwtPayload } }) {
    const userId = context.req.user.sub;
    return await this.scansService.getScansStats(userId);
  }

  @Mutation(() => Scan)
  @UseGuards(JwtAuthGuard)
  async createScan(
    @Context() context: { req: { user: JwtPayload } },
    @Args('input') input: CreateScanInput,
  ) {
    const userId = context.req.user.sub;
    return await this.scansService.createScan(input, userId);
  }
}
