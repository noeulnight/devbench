import { InjectDiscordClient } from '@discord-nestjs/core';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Client,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { addDays } from 'date-fns';
import { Prisma } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class PersonalChannelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    @InjectDiscordClient()
    private readonly discordClient: Client,
  ) {}

  public async getPersonalChannelInfo(userId: string) {
    return this.prismaService.personalChannel.findUnique({ where: { userId } });
  }

  private createdChannelEmbed = ({
    userId,
    startDate,
    endDate,
  }: {
    userId: string;
    startDate: Date;
    endDate: Date;
  }) =>
    new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle('🎉 개인 채널 생성 완료')
      .setDescription(
        `축하드립니다 <@${userId}>님!\n개인 채널이 생성되었습니다.`,
      )
      .addFields(
        {
          name: '시작일',
          value: startDate.toLocaleDateString('ko-KR'),
          inline: true,
        },
        {
          name: '만료일',
          value: endDate.toLocaleDateString('ko-KR'),
          inline: true,
        },
      );

  private updatedEndDateChannelEmbed = ({
    startDate,
    endDate,
  }: {
    userId: string;
    startDate: Date;
    endDate: Date;
  }) =>
    new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle('🎉 개인 채널 만료일 갱신')
      .setDescription(`개인 채널의 만료일이 갱신되었습니다.`)
      .addFields(
        {
          name: '시작일',
          value: startDate.toLocaleDateString('ko-KR'),
          inline: true,
        },
        {
          name: '만료일',
          value: endDate.toLocaleDateString('ko-KR'),
          inline: true,
        },
      );

  private alertChannelExpiredEmbed = ({ endDate }: { endDate: Date }) =>
    new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('🚨 개인 채널이 1일 뒤 완전히 삭제됩니다.')
      .setDescription(`개인 채널을 유지하시기 위해서는 만료일을 갱신해주세요`)
      .addFields({
        name: '만료 예정일',
        value: endDate.toLocaleDateString('ko-KR'),
      });

  async createOrUpdatePersonalChannel({
    userId,
    days,
    tx = this.prismaService,
  }: {
    userId: string;
    days: number;
    tx?: Prisma.TransactionClient;
  }) {
    const guild = await this.discordClient.guilds.fetch(
      this.configService.get('DISCORD_GUILD_ID'),
    );
    const member = await guild.members.fetch(userId);
    const category = await guild.channels.fetch(
      this.configService.get('PERSONAL_CHANNEL_CATEGORY_ID'),
    );
    if (!category)
      throw new NotFoundException(
        '개인 채널 카테고리를 찾을 수 없습니다. 관리자에게 문의해주세요.',
      );
    if (category.type !== ChannelType.GuildCategory)
      throw new BadRequestException('개인 채널 카테고리가 존재하지 않습니다.');

    const userPersonalChannel = await tx.personalChannel.findUnique({
      where: {
        userId,
      },
    });

    if (!userPersonalChannel) {
      const channel = await guild.channels.create({
        name: `${member.displayName}의 개인 채널`,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: member.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AttachFiles,
              PermissionsBitField.Flags.EmbedLinks,
              PermissionsBitField.Flags.AddReactions,
            ],
          },
          {
            id: guild.id,
            deny: [
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.SendMessagesInThreads,
              PermissionsBitField.Flags.MentionEveryone,
            ],
          },
        ],
      });

      const endDate = new Date(
        addDays(new Date(), days + 1).setHours(15, 0, 0, 0),
      );
      const personalChannel = await tx.personalChannel.create({
        data: {
          userId,
          channelId: channel.id,
          startDate: new Date(),
          endDate,
        },
      });

      await channel.send({
        content: `<@${userId}>`,
        embeds: [
          this.createdChannelEmbed({
            userId,
            startDate: new Date(),
            endDate,
          }),
        ],
      });

      return personalChannel;
    }

    const endDate = new Date(
      addDays(userPersonalChannel.endDate, days).setHours(15, 0, 0, 0),
    );
    const updatedPersonalChannel = await tx.personalChannel.update({
      where: { id: userPersonalChannel.id },
      data: { endDate, archivedAt: null },
    });

    const channel = await guild.channels.fetch(
      updatedPersonalChannel.channelId,
    );
    if (!channel.isSendable()) return updatedPersonalChannel;

    await channel.send({
      content: `<@${userId}>`,
      embeds: [
        this.updatedEndDateChannelEmbed({
          userId,
          startDate: userPersonalChannel.startDate,
          endDate: updatedPersonalChannel.endDate,
        }),
      ],
    });

    return updatedPersonalChannel;
  }

  @Cron('1 0 15 * * *')
  async checkPersonalChannel() {
    const guild = await this.discordClient.guilds.fetch(
      this.configService.get('DISCORD_GUILD_ID'),
    );

    return this.prismaService.$transaction(async (tx) => {
      const personalChannels = await tx.personalChannel.findMany({
        where: { endDate: { lt: new Date() } },
      });

      await Promise.allSettled(
        personalChannels.map(async (personalChannel) => {
          const channel = await guild.channels.fetch(personalChannel.channelId);
          if (personalChannel.archivedAt) {
            await tx.personalChannel.delete({
              where: { id: personalChannel.id },
            });
            await channel.delete('개인 채널 만료');
            return;
          }

          if (channel.type !== ChannelType.GuildText) return;
          const updatedPersonalChannel = await tx.personalChannel.update({
            where: { id: personalChannel.id },
            data: { archivedAt: new Date() },
          });

          await channel.send({
            content: `<@${personalChannel.userId}>`,
            embeds: [
              this.alertChannelExpiredEmbed({
                endDate: addDays(personalChannel.endDate, 1),
              }),
            ],
          });

          return updatedPersonalChannel;
        }),
      );
    });
  }
}
