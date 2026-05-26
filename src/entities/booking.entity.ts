import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Workshop } from './workshop.entity';

/** Уникальное ограничение: один пользователь — одна бронь на мастер-класс */
@Entity('bookings')
@Unique(['userId', 'workshopId'])
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  workshopId: number;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Workshop, (workshop) => workshop.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workshopId' })
  workshop: Workshop;

  @CreateDateColumn()
  createdAt: Date;
}
