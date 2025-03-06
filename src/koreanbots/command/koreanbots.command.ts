import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { KoreanbotsService } from '../koreanbots.service';

@Command({
  name: 'koreanbots',
  nameLocalizations: {
    'en-US': 'koreanbots',
    ko: '한디리',
  },
  description: '한디리 하트 보상을 확인합니다.',
  descriptionLocalizations: {
    'en-US': 'Receive a reward for a heart in Koreanbots.',
    ko: '한디리 하트 보상을 확인합니다.',
  },
})
@Injectable()
export class KoreanbotsCommand {
  constructor(private readonly koreanbotsService: KoreanbotsService) {}

  @Handler()
  async handle(@InteractionEvent() interaction: CommandInteraction) {
    const { voted } = await this.koreanbotsService.checkHearted(
      interaction.user.id,
    );

    if (!voted) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('❌ 한디리 하트 미완료')
            .setDescription(
              `한디리 하트를 완료하지 않았습니다.\n하트를 완료하고 다시 시도해주세요.`,
            ),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel('하트 누르러 가기')
              .setEmoji('💖')
              .setStyle(ButtonStyle.Link)
              .setURL('https://koreanbots.dev/servers/645137556777992203/vote'),
          ),
        ],
        flags: [MessageFlags.Ephemeral],
      });

      return;
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle('✅ 한디리 하트 완료!')
          .setDescription(
            `한디리 하트를 완료했습니다!\n보상으로 50XP와 50포인트를 지급했습니다.`,
          ),
      ],
      flags: [MessageFlags.Ephemeral],
    });
  }
}
