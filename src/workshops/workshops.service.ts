import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from '../entities/workshop.entity';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

/** Тип, расширяющий сущность мастер-класса виртуальным полем свободных мест */
type WorkshopWithSpotsLeft = Workshop & { spotsLeft: number };

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
  ) {}

  /** Возвращает все мастер-классы с количеством свободных мест.
   *  Использует единственный SQL-запрос (LEFT JOIN + COUNT + GROUP BY),
   *  чтобы избежать N+1 проблемы. */
  async findAll(): Promise<WorkshopWithSpotsLeft[]> {
    // Один запрос: SELECT w.*, COUNT(b.id) AS bookingCount FROM workshops w
    //              LEFT JOIN bookings b ON b.workshopId = w.id
    //              GROUP BY w.id
    const { entities, raw } = await this.workshopRepository
      .createQueryBuilder('w')
      .leftJoin('w.bookings', 'b')
      .addSelect('COUNT(b.id)', 'bookingCount')
      .groupBy('w.id')
      .getRawAndEntities();

    return entities.map((workshop, i) => {
      const bookingCount = Number(raw[i]?.bookingCount ?? 0);
      return Object.assign(workshop, { spotsLeft: workshop.capacity - bookingCount });
    });
  }

  /** Возвращает один мастер-класс по id; бросает NotFoundException если не найден.
   *  Использует единственный SQL-запрос (LEFT JOIN + COUNT + GROUP BY). */
  async findOne(id: number): Promise<WorkshopWithSpotsLeft> {
    // Один запрос: SELECT w.*, COUNT(b.id) AS bookingCount FROM workshops w
    //              LEFT JOIN bookings b ON b.workshopId = w.id
    //              WHERE w.id = :id
    //              GROUP BY w.id
    const { entities, raw } = await this.workshopRepository
      .createQueryBuilder('w')
      .leftJoin('w.bookings', 'b')
      .addSelect('COUNT(b.id)', 'bookingCount')
      .where('w.id = :id', { id })
      .groupBy('w.id')
      .getRawAndEntities();

    const workshop = entities[0];
    if (!workshop) {
      throw new NotFoundException(`Мастер-класс с id=${id} не найден`);
    }

    const bookingCount = Number(raw[0]?.bookingCount ?? 0);
    return Object.assign(workshop, { spotsLeft: workshop.capacity - bookingCount });
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
