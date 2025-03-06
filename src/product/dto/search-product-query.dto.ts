import { ProductType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class SearchProductQueryDto extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;
}
