import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, InteractionEvent, SubCommand } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { RevokePointOptions } from '../option/revoke-point.options';
import { PointService } from '../point.service';

@SubCommand({
  name: 'revoke',
  nameLocalizations: {
    'en-US': 'revoke',
    ko: '제거',
  },
  description: '포인트 제거 명령어입니다.',
  descriptionLocalizations: {
    'en-US': 'Revoke point to a user',
    ko: '포인트 제거 명령어입니다.',
  },
})
@Injectable()
export class RevokePointCommand {
  constructor(private readonly pointService: PointService) {}

  @Handler()
  async handle(
    @InteractionEvent() interaction: CommandInteraction,
    @InteractionEvent(SlashCommandPipe) options: RevokePointOptions,
  ) {
    const user = await interaction.guild.members.fetch(options.user);

    const { amount, reason } = options;
    await this.pointService.usePoint({
      userId: user.id,
      amount,
      reason,
    });
    const point = await this.pointService.getUserPoint(user.id);

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(
        `포인트를 ${user.user.username}님에게 ${amount}만큼 제거했습니다.`,
      )
      .setFields(
        {
          name: '제거 포인트',
          value: `${amount}`,
          inline: true,
        },
        {
          name: '총 포인트',
          value: `${point}`,
          inline: true,
        },
      );

    interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [embed],
    });
  }
}
