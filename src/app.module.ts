import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { BookingsModule } from './bookings/bookings.module';
import { SeederModule } from './seeder/seeder.module';
import { User } from './entities/user.entity';
import { Workshop } from './entities/workshop.entity';
import { Booking } from './entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH || 'data/workshop.db',
      entities: [User, Workshop, Booking],
      synchronize: true,
    }),
    AuthModule,
    WorkshopsModule,
    BookingsModule,
    SeederModule,
  ],
})
export class AppModule {}
