import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { Workshop } from '../entities/workshop.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
  ) {}

  async create(userId: number, dto: CreateBookingDto): Promise<Booking> {
    const workshop = await this.workshopRepository.findOne({
      where: { id: dto.workshopId },
    });

    if (!workshop) {
      throw new NotFoundException('Мастер-класс не найден');
    }

    if (workshop.date <= new Date()) {
      throw new BadRequestException('Мастер-класс уже прошёл');
    }

    const bookingCount = await this.bookingRepository.count({
      where: { workshopId: dto.workshopId },
    });

    if (bookingCount >= workshop.capacity) {
      throw new BadRequestException('Нет свободных мест');
    }

    const booking = this.bookingRepository.create({
      userId,
      workshopId: dto.workshopId,
    });

    try {
      const saved = await this.bookingRepository.save(booking);
      return (await this.bookingRepository.findOne({
        where: { id: saved.id },
        relations: { workshop: true },
      })) as Booking;
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        err.message.toLowerCase().includes('unique')
      ) {
        throw new ConflictException('Вы уже записаны на этот мастер-класс');
      }
      throw err;
    }
  }

  async findMyBookings(userId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { userId },
      relations: { workshop: true },
    });
  }

  async remove(id: number, userId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Бронь не найдена');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этой брони');
    }

    await this.bookingRepository.remove(booking);
    return booking;
  }
}
