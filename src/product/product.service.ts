import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchProductQueryDto } from './dto/search-product-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  public async count(dto: SearchProductQueryDto) {
    const { type, query } = dto;

    return this.prismaService.product.count({
      where: { isHidden: false, type, name: { contains: query } },
    });
  }

  public async getProducts(dto: SearchProductQueryDto) {
    const { page, pageSize, type, query } = dto;

    return this.prismaService.product.findMany({
      where: { isHidden: false, type, name: { contains: query } },
      skip: page,
      take: pageSize,
    });
  }

  public async getProductById(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: { id, isHidden: false },
    });
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');

    return product;
  }
}
