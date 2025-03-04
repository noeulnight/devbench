import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WarnOptions } from './option/warn.options';
import { UserService } from 'src/user/user.service';
@Injectable()
export class WarnService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  public async searchWarnTypes(name: string) {
    return this.prismaService.warnType.findMany({
      where: {
        name: {
          contains: name,
        },
      },
    });
  }

  public async getWarnHistory(userId: string) {
    const totalWarn = await this.prismaService.warnHistory.count({
      where: { userId },
    });
    const history = await this.prismaService.warnHistory.findMany({
      where: {
        userId,
      },
      include: {
        warnType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
    const { warn: totalWeight } = await this.userService.getUserById(userId);

    return {
      totalWarn,
      totalWeight,
      history,
    };
  }

  public async createWarnHistory(options: WarnOptions) {
    const { user: userId, reason, note, weight } = options;
    const user = await this.userService.getUserById(userId, true);

    return this.prismaService.$transaction(async (tx) => {
      const warnType = await tx.warnType.findUnique({
        where: { id: reason },
      });

      const warnWeight = weight ?? warnType.weight ?? 1;
      await tx.user.update({
        where: { id: user.id },
        data: { warn: { increment: warnWeight } },
      });

      return tx.warnHistory.create({
        data: {
          userId: user.id,
          warnTypeId: reason,
          reason: note,
          weight: warnWeight,
        },
        include: {
          warnType: true,
        },
      });
    });
  }
}
