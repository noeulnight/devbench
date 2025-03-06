import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { SearchProductQueryDto } from './dto/search-product-query.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(@Query() dto: SearchProductQueryDto) {
    const [nodes, totalCount] = await Promise.all([
      this.productService.getProducts(dto),
      this.productService.count(dto),
    ]);

    return { nodes, totalCount };
  }

  @Get(':id')
  async getProductById(@Param('id') id: number) {
    return this.productService.getProductById(id);
  }
}
