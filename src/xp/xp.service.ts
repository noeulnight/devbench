import { Injectable } from '@nestjs/common';
import { TransactionSource } from '@prisma/client';
import { TransactionType } from '@prisma/client';
import { Message } from 'discord.js';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

export interface CalculateLevelByXpResult {
  totalXp: number;
  currentLevel: number;
  currentXp: number;
  currentLevelXp: number;
  nextLevel: number;
  nextLevelXp: number;
  nextLevelTotalXp: number;
  remainingXp: number;
}

@Injectable()
export class XpService {
  private readonly levelPerXp = 98;
  private readonly xpPerMessageMin = 5;
  private readonly xpPerMessageMax = 15;

  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}

  public async getXpEvents({
    roleIds,
    channelId,
  }: {
    roleIds?: string[];
    channelId?: string;
  }) {
    return this.prismaService.xpEvent.findMany({
      where: {
        OR: [
          {
            roleId: null,
            channelId: null,
            OR: [{ endDate: { gte: new Date() } }, { endDate: null }],
          },
          {
            roleId: { in: roleIds },
            OR: [{ endDate: { gte: new Date() } }, { endDate: null }],
          },
          {
            channelId,
            OR: [{ endDate: { gte: new Date() } }, { endDate: null }],
          },
        ],
      },
    });
  }

  public async calculateXpAmount(message: Message) {
    const content = message.content;

    let xpMax = this.xpPerMessageMax;
    if (content.length < 10) xpMax = 8;

    const userRoles = message.member.roles.cache.map((role) => role.id);
    const messageChannelId = message.channel.id;

    const xpEvents = await this.getXpEvents({
      roleIds: userRoles,
      channelId: messageChannelId,
    });

    const eventAmount = xpEvents.reduce((acc, xpEvent) => acc + xpEvent.xp, 0);
    const defaultAmount =
      Math.floor(Math.random() * (xpMax - this.xpPerMessageMin + 1)) +
      this.xpPerMessageMin;

    return defaultAmount + eventAmount;
  }

  public calculateLevelByXp(xp: number): CalculateLevelByXpResult {
    const level = Math.floor(
      (-1 + Math.sqrt(1 + 8 * (xp / this.levelPerXp))) / 2,
    );
    const currentLevelXp = ((level * (level + 1)) / 2) * this.levelPerXp;
    const nextLevel = level + 1;
    const nextLevelXp = ((nextLevel * (nextLevel + 1)) / 2) * this.levelPerXp;
    const remainingXp = nextLevelXp - xp;

    return {
      totalXp: xp,
      currentLevel: level,
      currentXp: xp - currentLevelXp,
      currentLevelXp: currentLevelXp,
      nextLevel: nextLevel,
      nextLevelXp: nextLevelXp - currentLevelXp,
      nextLevelTotalXp: nextLevelXp,
      remainingXp: remainingXp,
    };
  }

  public calculateXpToLevel(
    xp: number,
    targetLevel: number,
  ): CalculateLevelByXpResult {
    const level = this.calculateLevelByXp(xp);
    const targetLevelXp =
      ((targetLevel * (targetLevel + 1)) / 2) * this.levelPerXp;
    const xpNeeded = targetLevelXp - xp;

    return {
      ...level,
      nextLevel: targetLevel,
      currentXp: xp,
      nextLevelXp: targetLevelXp,
      remainingXp: xpNeeded > 0 ? xpNeeded : 0,
    };
  }

  public async addXp(userId: string, amount: number, reason?: string) {
    const user = await this.userService.getUserById(userId);

    const xp = user.xp + amount;
    const level = this.calculateLevelByXp(xp);

    return this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { xp, level: level.currentLevel },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount,
          source: TransactionSource.XP,
          type: TransactionType.EARN,
          reason,
        },
      });

      return {
        hasLevelUp: level.currentLevel > user.level,
        level,
      };
    });
  }

  public async removeXp(userId: string, amount: number, reason?: string) {
    const user = await this.userService.getUserById(userId);
    const xp = user.xp - amount < 0 ? 0 : user.xp - amount;
    const level = this.calculateLevelByXp(xp);

    return this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { xp, level: level.currentLevel },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount,
          source: TransactionSource.XP,
          type: TransactionType.SPEND,
          reason,
        },
      });

      return {
        hasLevelDown: level.currentLevel < user.level,
        level,
      };
    });
  }
}
