import { InjectDiscordClient, On } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  AttachmentBuilder,
  Client,
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
  constructor(
    private readonly xpService: XpService,
    private readonly userService: UserService,
    private readonly levelImageService: LevelImageService,
    private readonly pointService: PointService,
    @InjectDiscordClient()
    private readonly discordClient: Client,
  ) {}

  private async bumpServerCheck(message: Message) {
    if (message.guild.id !== process.env.DISCORD_GUILD_ID) return;
    if (message.author.id !== '302050872383242240') return;

    const isBumped = message.embeds.some((embed) =>
      embed.description?.includes('서버 갱신 완료!'),
    );
    if (!isBumped) return;

    const channel = await this.discordClient.channels.cache.get(
      message.channel.id,
    );
    if (!channel.isSendable()) return;

    const bumpAmount = 30;
    await this.xpService.addXp(message.member, bumpAmount);
    await this.pointService.addPoint({
      userId: message.member.id,
      amount: bumpAmount,
    });

    const bumpMessage = await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle('🎉 서버 갱신 완료!')
          .setDescription(
            `<@${message.interactionMetadata.user.id}>님이 서버 갱신 완료! 축하합니다!\n100XP와 100포인트를 지급했습니다.`,
          ),
      ],
    });

    setTimeout(async () => {
      await bumpMessage.delete();
    }, 10000);
  }

  @On('messageCreate')
  async onMessageCreate(message: Message) {
    await this.bumpServerCheck(message);

    if (message.author.bot) return;
    if (message.content.length < 2) return;

    const amount = await this.xpService.calculateXpAmount(message);
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
