import { Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;

  @IsNumber()
  @Transform(({ value, obj }) => obj.pageSize * (Math.max(value, 1) - 1))
  page?: number = 1;
}
