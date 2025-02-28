import { InjectDiscordClient } from '@discord-nestjs/core';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductType, PurchaseStatus, User } from '@prisma/client';
import { Client } from 'discord.js';
import { PointService } from 'src/point/point.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectDiscordClient()
    private readonly discordClient: Client,
    private readonly prismaService: PrismaService,
    private readonly pointService: PointService,
    private readonly configService: ConfigService,
  ) {}

  public async getPurchasesByUserId(userId: string) {
    const purchases = await this.prismaService.purchase.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
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

      let status: PurchaseStatus = PurchaseStatus.PENDING;
      if (product.type === ProductType.ROLE) {
        await this.addRole(user.id, product.id);
        status = PurchaseStatus.COMPLETED;
      }

      return tx.purchase.create({
        data: {
          userId: user.id,
          productId: product.id,
          transactionId: point.id,
          price: product.price,
          status,
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

  private async addRole(userId: string, productId: number) {
    const productRoles = await this.prismaService.productRole.findMany({
      where: { productId },
    });
    const roleIds = productRoles.map((productRole) => productRole.roleId);
    const guild = await this.discordClient.guilds.fetch(
      this.configService.get('DISCORD_GUILD_ID'),
    );
    const member = await guild.members.fetch(userId);

    await member.roles.add(roleIds);
  }
}
