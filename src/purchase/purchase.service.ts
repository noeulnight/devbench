import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseStatus, User } from '@prisma/client';
import { PointService } from 'src/point/point.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PurchaseService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pointService: PointService,
  ) {}

  public async getPurchasesByUserId(userId: string) {
    const purchases = await this.prismaService.purchase.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    return purchases;
  }

  public async countPurchasesByUserId(userId: string) {
    const count = await this.prismaService.purchase.count({
      where: { userId },
    });

    return count;
  }

  public async purchaseProduct(productId: number, user: User) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId, isHidden: false },
    });
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');
    if (product.price > user.point)
      throw new BadRequestException('포인트가 부족합니다.');

    return this.prismaService.$transaction(async (tx) => {
      const point = await this.pointService.usePoint({
        userId: user.id,
        amount: product.price,
        reason: `상품 구매: ${product.name}`,
        tx,
      });

      return tx.purchase.create({
        data: {
          userId: user.id,
          productId: product.id,
          transactionId: point.id,
          price: product.price,
          status: PurchaseStatus.PENDING,
        },
      });
    });
  }

  public async getPurchase(id: string, user: User) {
    const purchase = await this.prismaService.purchase.findUnique({
      where: { id, userId: user.id },
      include: {
        product: true,
      },
    });
    if (!purchase) throw new NotFoundException('구매 내역을 찾을 수 없습니다.');

    return purchase;
  }
}
