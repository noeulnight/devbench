import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  MessageFlags,
} from 'discord.js';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Command({
  name: 'leaderboard',
  nameLocalizations: {
    'en-US': 'leaderboard',
    ko: '리더보드',
  },
  description: '리더보드를 확인합니다.',
  descriptionLocalizations: {
    'en-US': 'Check leaderboard',
    ko: '리더보드를 확인합니다.',
  },
})
@Injectable()
export class LeaderboardCommand {
  constructor(private readonly configService: ConfigService) {}

  @Handler()
  async onRegistration(@InteractionEvent() interaction: CommandInteraction) {
    const button = new ButtonBuilder()
      .setURL(`${this.configService.get('SERVICE_URL')}/leaderboard`)
      .setLabel('리더보드 확인하기')
      .setStyle(ButtonStyle.Link)
      .setEmoji('🏆');

    await interaction.reply({
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)],
      flags: [MessageFlags.Ephemeral],
    });
  }
}
