import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(@Query() pagination: PaginationQueryDto) {
    const [nodes, totalCount] = await Promise.all([
      this.productService.getProducts(pagination),
      this.productService.count(),
    ]);

    return { nodes, totalCount };
  }

  @Get(':id')
  async getProductById(@Param('id') id: number) {
    return this.productService.getProductById(id);
  }
}
