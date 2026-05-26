import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from '../entities/workshop.entity';
import { Booking } from '../entities/booking.entity';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

/** Тип, расширяющий сущность мастер-класса виртуальным полем свободных мест */
type WorkshopWithSpotsLeft = Workshop & { spotsLeft: number };

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,

    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  /** Считает количество бронирований для заданного мастер-класса */
  private async getBookingCount(workshopId: number): Promise<number> {
    return this.bookingRepository.count({ where: { workshopId } });
  }

  /** Добавляет поле spotsLeft к одному мастер-классу */
  private async withSpotsLeft(workshop: Workshop): Promise<WorkshopWithSpotsLeft> {
    const bookingCount = await this.getBookingCount(workshop.id);
    return Object.assign(workshop, { spotsLeft: workshop.capacity - bookingCount });
  }

  /** Возвращает все мастер-классы с количеством свободных мест */
  async findAll(): Promise<WorkshopWithSpotsLeft[]> {
    const workshops = await this.workshopRepository.find();
    // Параллельно обогащаем каждый мастер-класс данными о свободных местах
    return Promise.all(workshops.map((w) => this.withSpotsLeft(w)));
  }

  /** Возвращает один мастер-класс по id; бросает NotFoundException если не найден */
  async findOne(id: number): Promise<WorkshopWithSpotsLeft> {
    const workshop = await this.workshopRepository.findOne({ where: { id } });
    if (!workshop) {
      throw new NotFoundException(`Мастер-класс с id=${id} не найден`);
    }
    return this.withSpotsLeft(workshop);
  }

  /** Создаёт новый мастер-класс */
  async create(dto: CreateWorkshopDto): Promise<Workshop> {
    const workshop = this.workshopRepository.create(dto);
    return this.workshopRepository.save(workshop);
  }

  /** Обновляет мастер-класс; бросает NotFoundException если не найден */
  async update(id: number, dto: UpdateWorkshopDto): Promise<Workshop> {
    const workshop = await this.workshopRepository.findOne({ where: { id } });
    if (!workshop) {
      throw new NotFoundException(`Мастер-класс с id=${id} не найден`);
    }
    // Мерджим только переданные поля
    Object.assign(workshop, dto);
    return this.workshopRepository.save(workshop);
  }

  /** Удаляет мастер-класс; бросает NotFoundException если не найден */
  async remove(id: number): Promise<void> {
    const workshop = await this.workshopRepository.findOne({ where: { id } });
    if (!workshop) {
      throw new NotFoundException(`Мастер-класс с id=${id} не найден`);
    }
    await this.workshopRepository.remove(workshop);
  }
}
