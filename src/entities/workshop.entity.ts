import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity('workshops')
export class Workshop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  /** Дата и время проведения мастер-класса */
  @Column()
  date: Date;

  /** Максимальное количество участников */
  @Column()
  capacity: number;

  /** Ссылка на обложку мастер-класса (опционально) */
  @Column({ nullable: true, type: 'varchar' })
  imageUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Booking, (booking) => booking.workshop)
  bookings: Booking[];
}
