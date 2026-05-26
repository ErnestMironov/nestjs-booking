import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

/** Проверяет, что дата не находится в прошлом */
@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return new Date(value) > new Date();
  }

  defaultMessage(): string {
    return 'Дата должна быть в будущем';
  }
}

export function IsFutureDate(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
