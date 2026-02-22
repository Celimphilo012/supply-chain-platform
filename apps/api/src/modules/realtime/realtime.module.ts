// apps/api/src/modules/realtime/realtime.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InventoryGateway } from './inventory.gateway';
import { RealtimeService } from './realtime.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [InventoryGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
