import { IsInt, IsPositive } from 'class-validator';

export class CreateBookingDto {
  /** ID мастер-класса для бронирования */
  @IsInt()
  @IsPositive()
  workshopId: number;
}
