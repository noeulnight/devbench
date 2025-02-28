import { On } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  AttachmentBuilder,
  EmbedBuilder,
  GuildMember,
  Message,
} from 'discord.js';
import { LevelImageService } from 'src/level-image/level-image.service';
import { PointService } from 'src/point/point.service';
import { UserService } from 'src/user/user.service';
import { CalculateLevelByXpResult, XpService } from 'src/xp/xp.service';

@Injectable()
export class LevelService {
  private readonly xpPerMessageMin = 5;
  private readonly xpPerMessageMax = 15;

  constructor(
    private readonly xpService: XpService,
    private readonly userService: UserService,
    private readonly levelImageService: LevelImageService,
    private readonly pointService: PointService,
  ) {}

  private calculateAmount(length: number) {
    let xpMax = this.xpPerMessageMax;
    if (length < 10) xpMax = 8;

    return (
      Math.floor(Math.random() * (xpMax - this.xpPerMessageMin + 1)) +
      this.xpPerMessageMin
    );
  }

  @On('messageCreate')
  async onMessageCreate(message: Message) {
    if (message.author.bot) return;
    if (message.content.length < 2) return;

    const amount = this.calculateAmount(message.content.length);
    const { hasLevelUp, level } = await this.xpService.addXp(
      message.member,
      amount,
    );

    await this.pointService.addPoint({
      userId: message.member.id,
      amount,
    });

    if (hasLevelUp) {
      const { attachment, embed } = await this.generateLevelEmbed(
        message.member,
        level,
        hasLevelUp,
      );

      const noticeMessage = await message.reply({
        embeds: [embed],
        files: [attachment],
      });

      setTimeout(async () => {
        await noticeMessage.delete();
      }, 6000);
    }
  }

  public async getLevelEmbedByUser(
    discordUser: GuildMember,
    targetLevel?: number,
  ) {
    const user = await this.userService.getUserById(discordUser.id);

    const level = targetLevel
      ? this.xpService.calculateXpToLevel(user.xp, targetLevel)
      : this.xpService.calculateLevelByXp(user.xp);

    return this.generateLevelEmbed(discordUser, level, false);
  }

  private async generateLevelEmbed(
    discordUser: GuildMember,
    level: CalculateLevelByXpResult,
    isLevelUp: boolean,
  ) {
    const attachment = new AttachmentBuilder(
      await this.levelImageService.generateLevelImage({
        nickname: discordUser.displayName,
        avatarUrl: discordUser.displayAvatarURL(),
        currentLevel: level.currentLevel,
        nextLevel: level.nextLevel,
        currentXp: level.currentXp,
        nextXp: level.nextLevelXp,
        isLevelUp,
      }),
      { name: 'level.png' },
    );

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(
        isLevelUp
          ? `:tada: **${discordUser.displayName}**님이 ${level.currentLevel}레벨을 달성하였습니다!`
          : `**${discordUser.displayName}**님은 ${level.currentLevel}레벨입니다!`,
      )
      .setImage('attachment://level.png');

    return { attachment, embed };
  }
}
