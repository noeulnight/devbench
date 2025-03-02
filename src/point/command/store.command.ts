import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ActionRowBuilder,
  ButtonStyle,
  CommandInteraction,
  MessageFlags,
} from 'discord.js';
import { ButtonBuilder } from 'discord.js';

@Command({
  name: 'store',
  nameLocalizations: {
    'en-US': 'store',
    ko: '스토어',
  },
  description: '포인트로 구매할 수 있는 상품들입니다.',
  descriptionLocalizations: {
    'en-US': 'point store',
    ko: '포인트로 구매할 수 있는 상품들입니다.',
  },
})
@Injectable()
export class StoreCommand {
  constructor(private readonly configService: ConfigService) {}

  @Handler()
  async handle(@InteractionEvent() interaction: CommandInteraction) {
    const button = new ButtonBuilder()
      .setURL(`${this.configService.get('SERVICE_URL')}/store`)
      .setLabel('스토어로 이동하기')
      .setStyle(ButtonStyle.Link)
      .setEmoji('🛍️');

    await interaction.reply({
      content: '스토어를 확인해보세요 🚀',
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)],
      flags: [MessageFlags.Ephemeral],
    });
  }
}
