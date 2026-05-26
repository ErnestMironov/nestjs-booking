import { IsString, IsDateString, IsInt, Min, MinLength, IsUrl, IsOptional } from 'class-validator';

export class CreateWorkshopDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  /** Дата проведения мастер-класса в формате ISO 8601 */
  @IsDateString()
  date: string;

  /** Максимальное количество участников */
  @IsInt()
  @Min(1)
  capacity: number;

  /** URL обложки мастер-класса */
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
