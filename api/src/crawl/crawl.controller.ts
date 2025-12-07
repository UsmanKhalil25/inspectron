import {
  Controller,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CrawlService } from "./crawl.service";
import type {
  StartCrawlRequest,
  StartCrawlResponse,
  StopCrawlResponse,
} from "shared";

@Controller("crawl")
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async startCrawl(
    @Body() body: StartCrawlRequest,
  ): Promise<StartCrawlResponse> {
    return this.crawlService.startCrawl(body);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async stopCrawl(): Promise<StopCrawlResponse> {
    return this.crawlService.stopCrawl();
  }
}
