import { InjectDiscordClient } from '@discord-nestjs/core';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Prisma,
  Product,
  ProductType,
  PurchaseStatus,
  User,
} from '@prisma/client';
import { addDays } from 'date-fns';
import { Client, WebhookClient, EmbedBuilder, Colors } from 'discord.js';
import { PointService } from 'src/point/point.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PersonalChannelService } from 'src/personal-channel/personal-channel.service';
@Injectable()
export class PurchaseService {
  constructor(
    @InjectDiscordClient()
    private readonly discordClient: Client,
    private readonly prismaService: PrismaService,
    private readonly pointService: PointService,
    private readonly configService: ConfigService,
    private readonly personalChannelService: PersonalChannelService,
  ) {}

  private purchaseWebhookClient = new WebhookClient({
    url: this.configService.get('DISCORD_PURCHASE_WEBHOOK_URL'),
  });

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

      const purchase = await tx.purchase.create({
        data: {
          userId: user.id,
          productId: product.id,
          transactionId: point.id,
          price: product.price,
          status: PurchaseStatus.PENDING,
        },
      });

      const purchaseStatus = await this.processPurchase({
        purchaseId: purchase.id,
        product,
        user,
        tx,
      });

      const updatedPurchase = await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: purchaseStatus },
      });

      await this.purchaseWebhookClient.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('상품 구매 완료')
            .setDescription(
              `<@${user.id}>님이 ${product.name}(#${product.id}) 상품을 구매했습니다.`,
            )
            .addFields(
              { name: '주문 번호', value: purchase.id },
              { name: '구매자', value: `<@${user.id}>` },
              { name: '상품', value: `${product.name}(${product.id})` },
              {
                name: '가격',
                value: `${product.price.toLocaleString()} 포인트`,
              },
              {
                name: '구매일',
                value: updatedPurchase.createdAt.toLocaleString('ko-KR'),
              },
              {
                name: '구매 상태',
                value: updatedPurchase.status,
              },
            ),
        ],
      });

      return updatedPurchase;
    });
  }

  private async processPurchase({
    purchaseId,
    product,
    user,
    tx,
  }: {
    purchaseId: string;
    product: Product;
    user: User;
    tx: Prisma.TransactionClient;
  }) {
    if (product.type === ProductType.ROLE) {
      await this.addRole(user.id, product.id, tx);
      return PurchaseStatus.COMPLETED;
    }

    if (product.type === ProductType.EXPERIENCE_BOOST) {
      await this.addXpBoost(purchaseId, user.id, product.id, tx);
      return PurchaseStatus.COMPLETED;
    }

    if (product.type === ProductType.PERSONAL_CHANNEL) {
      await this.addPersonalChannel(user.id, product.id, tx);
      return PurchaseStatus.COMPLETED;
    }

    return PurchaseStatus.PENDING;
  }

  public async getPurchase(id: string, user: User) {
    const purchase = await this.prismaService.purchase.findUnique({
      where: { id, userId: user.id },
      include: { product: true },
    });
    if (!purchase) throw new NotFoundException('구매 내역을 찾을 수 없습니다.');

    return purchase;
  }

  private async addRole(
    userId: string,
    productId: number,
    tx: Prisma.TransactionClient,
  ) {
    const productRoles = await tx.productRole.findMany({
      where: { productId },
    });
    const roleIds = productRoles.map((productRole) => productRole.roleId);
    const guild = await this.discordClient.guilds.fetch(
      this.configService.get('DISCORD_GUILD_ID'),
    );
    const member = await guild.members.fetch(userId);

    await member.roles.add(roleIds);
  }

  private async addXpBoost(
    purchaseId: string,
    userId: string,
    productId: number,
    tx: Prisma.TransactionClient,
  ) {
    const xpBoost = await tx.productXpBoost.findUnique({
      where: { productId },
    });
    if (!xpBoost)
      throw new NotFoundException(
        '경험치 부스트 상품을 찾을 수 없습니다. 관리자에게 문의해주세요.',
      );

    await tx.xpEvent.create({
      data: {
        name: `${purchaseId} 경험치 부스트`,
        userId,
        xp: xpBoost.boostAmount,
        startDate: new Date(),
        endDate: addDays(new Date(), xpBoost.boostDays),
      },
    });
  }

  private async addPersonalChannel(
    userId: string,
    productId: number,
    tx: Prisma.TransactionClient,
  ) {
    const productPersonalChannel = await tx.productPersonalChannel.findUnique({
      where: { productId },
    });
    if (!productPersonalChannel)
      throw new NotFoundException(
        '개인 채널 상품을 찾을 수 없습니다. 관리자에게 문의해주세요.',
      );

    return this.personalChannelService.createOrUpdatePersonalChannel({
      days: productPersonalChannel.channelDays,
      userId,
      tx,
    });
  }
}
