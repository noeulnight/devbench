import { TextInputValue } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';

export class RevokeXpDto {
  @TextInputValue()
  userId: string;

  @TextInputValue()
  @Transform(({ value }) => Number(value))
  amount: number;

  @TextInputValue()
  reason: string;
}
