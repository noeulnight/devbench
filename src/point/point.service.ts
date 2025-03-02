import { Injectable } from '@nestjs/common';
import { Prisma, TransactionSource, TransactionType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PointService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  public async getUserPoint(userId: string) {
    const user = await this.userService.getUserById(userId);
    return user.point;
  }

  public async addPoint({
    userId,
    amount,
    reason,
  }: {
    userId: string;
    amount: number;
    reason?: string;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { point: { increment: amount } },
      });

      return tx.transaction.create({
        data: {
          userId,
          amount,
          type: TransactionType.EARN,
          source: TransactionSource.POINT,
          reason,
        },
      });
    });
  }

  public async usePoint({
    userId,
    amount,
    reason,
    tx = this.prismaService,
  }: {
    userId: string;
    amount: number;
    reason?: string;
    tx?: Prisma.TransactionClient;
  }) {
    await tx.user.update({
      where: { id: userId },
      data: { point: { decrement: amount } },
    });

    return tx.transaction.create({
      data: {
        userId,
        amount,
        type: TransactionType.SPEND,
        source: TransactionSource.POINT,
        reason,
      },
    });
  }
}
