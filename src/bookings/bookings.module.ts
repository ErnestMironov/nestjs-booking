import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../entities/booking.entity';
import { Workshop } from '../entities/workshop.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Workshop])],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
