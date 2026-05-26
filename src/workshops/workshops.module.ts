import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from '../entities/workshop.entity';
import { WorkshopsService } from './workshops.service';
import { WorkshopsController } from './workshops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop])],
  providers: [WorkshopsService],
  controllers: [WorkshopsController],
})
export class WorkshopsModule {}
