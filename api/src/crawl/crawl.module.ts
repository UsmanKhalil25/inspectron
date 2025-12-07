import { Module } from "@nestjs/common";
import { CrawlController } from "./crawl.controller";
import { CrawlService } from "./crawl.service";
import { CrawlGateway } from "./crawl.gateway";

@Module({
  controllers: [CrawlController],
  providers: [CrawlService, CrawlGateway],
})
export class CrawlModule {}
