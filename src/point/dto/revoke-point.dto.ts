import { TextInputValue } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';

export class RevokePointDto {
  @TextInputValue()
  userId: string;

  @TextInputValue()
  @Transform(({ value }) => Number(value))
  amount: number;

  @TextInputValue()
  reason: string;
}
