import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, InteractionEvent, SubCommand } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { GrantPointOptions } from '../option/grant-point.options';
import { PointService } from '../point.service';

@SubCommand({
  name: 'grant',
  nameLocalizations: {
    'en-US': 'grant',
    ko: '지급',
  },
  description: '포인트 지급 명령어입니다.',
  descriptionLocalizations: {
    'en-US': 'Grant point to a user',
    ko: '포인트 지급 명령어입니다.',
  },
})
@Injectable()
export class GrantPointCommand {
  constructor(private readonly pointService: PointService) {}

  @Handler()
  async handle(
    @InteractionEvent() interaction: CommandInteraction,
    @InteractionEvent(SlashCommandPipe) options: GrantPointOptions,
  ) {
    const user = await interaction.guild.members.fetch(options.user);

    const { amount, reason } = options;
    await this.pointService.addPoint({
      userId: user.id,
      amount,
      reason,
    });
    const point = await this.pointService.getUserPoint(user.id);

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(
        `포인트를 ${user.user.username}님에게 ${amount}만큼 지급했습니다.`,
      )
      .setFields(
        {
          name: '지급 포인트',
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
