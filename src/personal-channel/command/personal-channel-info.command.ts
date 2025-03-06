import { Handler, InteractionEvent, SubCommand } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { CommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { PersonalChannelService } from '../personal-channel.service';
import { differenceInDays } from 'date-fns';

@SubCommand({
  name: 'info',
  nameLocalizations: {
    'en-US': 'info',
    ko: '정보',
  },
  description: '개인 채널 정보를 확인합니다.',
  descriptionLocalizations: {
    'en-US': 'check personal channel info',
    ko: '개인 채널 정보를 확인합니다.',
  },
})
@Injectable()
export class PersonalChannelInfoCommand {
  constructor(
    private readonly personalChannelService: PersonalChannelService,
  ) {}

  @Handler()
  async handle(@InteractionEvent() interaction: CommandInteraction) {
    const personalChannel =
      await this.personalChannelService.getPersonalChannelInfo(
        interaction.user.id,
      );

    if (!personalChannel) {
      return interaction.reply({
        content: '개인 채널 정보를 찾을 수 없습니다.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle(`${interaction.user.displayName}님의 개인 채널 정보`)
          .setDescription(`<#${personalChannel.channelId}>`)
          .addFields([
            {
              name: '시작일',
              value: personalChannel.startDate.toLocaleDateString(),
              inline: true,
            },
            {
              name: '종료일',
              value: personalChannel.endDate.toLocaleDateString(),
              inline: true,
            },
            {
              name: '남은 기간',
              value: `${differenceInDays(
                personalChannel.endDate,
                new Date(),
              )}일`,
              inline: true,
            },
          ]),
      ],
      flags: [MessageFlags.Ephemeral],
    });
  }
}
