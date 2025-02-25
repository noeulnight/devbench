import { Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsNumber()
  @Min(0)
  @Transform(({ value, obj }) => (obj.page + 1) * value)
  pageSize?: number = 10;

  @IsNumber()
  @Min(0)
  page?: number = 0;
}
