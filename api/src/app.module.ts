import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ScreencastModule } from "./screencast/screencast.module";
import { CrawlModule } from "./crawl/crawl.module";

@Module({
  imports: [ScreencastModule, CrawlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
