import {
  Query,
  Mutation,
  Subscription,
  Resolver,
  Context,
  Args,
} from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScansService } from './scans.service';
import { BrowserAgentService } from './browser-agent.service';
import { BrowserPreviewStreamService } from './browser-preview-stream.service';

import { CreateScanInput } from './inputs/create-scan.input';
import { ScanFiltersInput } from './inputs/scan-filters.input';
import { PaginationArgs } from 'src/commom/inputs/pagination-args.input';

import { ScansResponse } from './types/scans-response.type';
import { Scan } from './types/scan.type';
import { ScanStats } from './types/scan-stats.type';
import { ScanEvent } from './types/scan-event.type';
import { BrowserPreviewFrame } from './types/browser-preview-stream.type';

import { JwtPayload } from 'src/commom/interfaces/jwt-payload.interface';
import {
  PUB_SUB,
  SCAN_STATUS_CHANGED,
  SCAN_EVENTS,
  BROWSER_PREVIEW_STREAM,
} from './scans.constants';

@Resolver(() => Scan)
export class ScansResolver {
  constructor(
    private readonly scansService: ScansService,
    private readonly browserAgentService: BrowserAgentService,
    private readonly browserPreviewStreamService: BrowserPreviewStreamService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

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

  @Query(() => String, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async scanScreenshot(
    @Args('runId') runId: string,
    @Context() _context: { req: { user: JwtPayload } },
  ) {
    return await this.browserAgentService.getScreenshot(runId);
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

  @Subscription(() => Scan, {
    filter: (
      payload: { scanStatusChanged: { id: string } },
      variables: { scanId: string },
    ) => {
      return payload.scanStatusChanged.id === variables.scanId;
    },
  })
  scanStatusChanged(@Args('scanId') _scanId: string) {
    return this.pubSub.asyncIterableIterator(SCAN_STATUS_CHANGED);
  }

  @Subscription(() => ScanEvent, {
    filter: (
      payload: { scanEvents: { scanId: string } },
      variables: { scanId: string },
    ) => {
      return payload.scanEvents.scanId === variables.scanId;
    },
  })
  scanEvents(@Args('scanId') _scanId: string) {
    return this.pubSub.asyncIterableIterator(SCAN_EVENTS);
  }

  @Subscription(() => BrowserPreviewFrame, {
    filter: (
      payload: { browserPreviewStream: { runId: string } },
      variables: { runId: string },
    ) => {
      return payload.browserPreviewStream.runId === variables.runId;
    },
  })
  browserPreviewStream(@Args('runId') runId: string) {
    this.browserPreviewStreamService.startStream(runId, this.pubSub);
    return this.pubSub.asyncIterableIterator(BROWSER_PREVIEW_STREAM);
  }
}
