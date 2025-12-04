import { Module } from "@nestjs/common";
import { ScreencastGateway } from "./screencast.gateway";

@Module({
  providers: [ScreencastGateway],
})
export class ScreencastModule {}
