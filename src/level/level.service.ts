import { InjectDiscordClient, On } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  Events,
  GuildMember,
  Message,
  VoiceState,
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
    private readonly configService: ConfigService,
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
      await this.xpService.calculateXpAmount({
        content: message.content,
        member: message.member,
        channelId: message.channel.id,
        userId: message.author.id,
        isVoice: false,
      });
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

  private intervals = new Map<string, NodeJS.Timeout>();
  private readonly ACTIVE_USER_TIMEOUT = 1000 * 5 * 60; // 5 minutes
  @On(Events.VoiceStateUpdate)
  async onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    const userId = newState.member?.id;
    if (!userId) return;

    const oldChannelId = oldState?.channelId;
    const channelId = newState?.channelId;
    if (!channelId) {
      this.deleteInterval(userId);
      return;
    }

    if (oldChannelId !== null && oldChannelId !== channelId) {
      this.deleteInterval(userId);
    }

    if (this.intervals.has(userId)) return;
    this.addInterval(userId, channelId);
  }

  public async checkUserInVoice(userId: string, channelId: string) {
    try {
      if (!this.intervals.has(userId)) return;

      const DISCORD_GUILD_ID = this.configService.get('DISCORD_GUILD_ID');
      const member = await this.discordClient.guilds.cache
        .get(DISCORD_GUILD_ID)
        ?.members.fetch(userId);

      if (!member || !member?.voice?.channel) {
        this.deleteInterval(userId);
        return;
      }

      if (member.voice.mute) return;

      const { totalAmount } = await this.xpService.calculateXpAmount({
        member,
        channelId,
        userId,
        isVoice: true,
      });

      await Promise.all([
        this.xpService.addXp({
          userId,
          amount: totalAmount,
          reason: '음성 채널 참여',
        }),
        this.pointService.addPoint({
          userId,
          amount: totalAmount,
          reason: '음성 채널 참여',
        }),
      ]);

      this.addInterval(userId, channelId);
    } catch (error) {
      console.error('Error in checkUserInVoice:', error);
      this.deleteInterval(userId);
    }
  }

  private addInterval(userId: string, channelId: string) {
    this.intervals.set(
      userId,
      setTimeout(
        () => this.checkUserInVoice(userId, channelId),
        this.ACTIVE_USER_TIMEOUT,
      ),
    );
  }

  private deleteInterval(userId: string) {
    if (this.intervals.has(userId)) {
      const timer = this.intervals.get(userId);
      clearTimeout(timer);
      this.intervals.delete(userId);
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
