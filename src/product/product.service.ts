import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  public async count() {
    return this.prismaService.product.count({
      where: { isHidden: false },
    });
  }

  public async getProducts(pagination: PaginationQueryDto) {
    const { page, pageSize } = pagination;

    return this.prismaService.product.findMany({
      where: { isHidden: false },
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
