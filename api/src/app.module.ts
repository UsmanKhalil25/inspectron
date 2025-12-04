import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ScreencastModule } from "./screencast/screencast.module";

@Module({
  imports: [ScreencastModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
