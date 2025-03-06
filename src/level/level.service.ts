import { InjectDiscordClient, On } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  Events,
  GuildMember,
  Message,
} from 'discord.js';
import { LevelImageService } from 'src/level-image/level-image.service';
import { PointService } from 'src/point/point.service';
import { UserService } from 'src/user/user.service';
import { CalculateLevelByXpResult, XpService } from 'src/xp/xp.service';

@Injectable()
export class LevelService {
  constructor(
    private readonly xpService: XpService,
    private readonly userService: UserService,
    private readonly levelImageService: LevelImageService,
    private readonly pointService: PointService,
    @InjectDiscordClient()
    private readonly discordClient: Client,
  ) {}

  private async recommendServerCheck(message: Message) {
    if (message.guild.id !== process.env.DISCORD_GUILD_ID) return;
    if (message.author.id !== '664647740877176832') return;

    const up = message.embeds.some((embed) =>
      embed.description?.includes('UP'),
    );
    const recommend = message.embeds.some((embed) =>
      embed.description?.includes('추천'),
    );
    if (!up && !recommend) return;

    const channel = await this.discordClient.channels.cache.get(
      message.channel.id,
    );
    if (!channel.isSendable()) return;

    const userId = message.interactionMetadata.user.id;

    const amount = recommend ? 50 : 30;
    await this.xpService.addXp({
      userId,
      amount,
      reason: '서버 갱신',
    });
    await this.pointService.addPoint({
      userId,
      amount,
      reason: '서버 갱신',
    });

    const successMessage = up ? '서버 갱신 완료' : '서버 추천 완료';
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle(`🎉 ${successMessage}!`)
          .setDescription(
            `<@${message.interactionMetadata.user.id}>님이 ${successMessage}!\n${amount}XP와 ${amount}포인트를 지급했습니다.`,
          )
          .setTimestamp(),
      ],
    });
  }

  @On(Events.MessageCreate)
  async onMessageCreate(message: Message) {
    await this.recommendServerCheck(message);

    if (message.author.bot) return;
    if (message.content.length < 2) return;

    const { totalAmount, defaultAmount } =
      await this.xpService.calculateXpAmount(message);
    const { hasLevelUp, level } = await this.xpService.addXp({
      userId: message.member.id,
      amount: totalAmount,
    });

    await this.pointService.addPoint({
      userId: message.member.id,
      amount: defaultAmount,
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
