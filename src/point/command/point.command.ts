import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { PointService } from '../point.service';

@Command({
  name: 'point',
  nameLocalizations: {
    'en-US': 'point',
    ko: '포인트',
  },
  description: '포인트를 조회할 수 있습니다.',
  descriptionLocalizations: {
    'en-US': 'check point',
    ko: '포인트를 조회할 수 있습니다.',
  },
})
@Injectable()
export class PointCommand {
  constructor(private readonly pointService: PointService) {}

  @Handler()
  async handle(@InteractionEvent() interaction: CommandInteraction) {
    const point = await this.pointService.getUserPoint(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle('☘️ 포인트 조회')
      .setColor(Colors.Green)
      .setDescription(
        `현재 ${interaction.user.displayName}님이 소유하고 있는 포인트는 ${point.toLocaleString()}점 입니다!`,
      );

    await interaction.reply({
      embeds: [embed],
      flags: [MessageFlags.Ephemeral],
    });
  }
}
