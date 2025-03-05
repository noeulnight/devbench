import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { WarnService } from '../warn.service';

@Command({
  name: 'warnhistory',
  nameLocalizations: {
    'en-US': 'warnhistory',
    ko: '경고내역',
  },
  description: '경고 내역을 조회할 수 있습니다.',
  descriptionLocalizations: {
    'en-US': 'warn history',
    ko: '경고 내역',
  },
})
@Injectable()
export class WarnHistoryCommand {
  constructor(private readonly warnService: WarnService) {}

  @Handler()
  async handle(@InteractionEvent() interaction: CommandInteraction) {
    const { totalWarn, totalWeight, history } =
      await this.warnService.getWarnHistory(interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('🚨 경고 내역 안내')
      .setDescription(
        `<@${interaction.user.id}>님에게 지급된 최근 5개의 경고 내역을 알려드립니다.`,
      )
      .addFields(
        {
          name: '총 경고 횟수',
          value: `${totalWarn}회`,
          inline: true,
        },
        {
          name: '총 경고 가중치',
          value: `${totalWeight}`,
          inline: true,
        },
      )
      .addFields(
        history.map((warn) => ({
          name: `${warn.warnType.name} #${warn.id}`,
          value: `가중치: ${warn.weight}\n지급 일시: ${warn.createdAt.toLocaleString('ko-KR')}`,
        })),
      );

    await interaction.reply({
      flags: [MessageFlags.Ephemeral],
      embeds: [embed],
    });
  }
}
