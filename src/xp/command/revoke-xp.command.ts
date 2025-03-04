import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, InteractionEvent, SubCommand } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { RevokeXpOptions } from '../option/revoke-xp.options';
import { XpService } from '../xp.service';

@SubCommand({
  name: 'revoke',
  nameLocalizations: {
    'en-US': 'revoke',
    ko: '제거',
  },
  description: '경험치 제거 명령어입니다.',
  descriptionLocalizations: {
    'en-US': 'revoke xp to a user',
    ko: '경험치 제거 명령어입니다.',
  },
})
@Injectable()
export class RevokeXpCommand {
  constructor(private readonly xpService: XpService) {}

  @Handler()
  async handle(
    @InteractionEvent() interaction: CommandInteraction,
    @InteractionEvent(SlashCommandPipe) options: RevokeXpOptions,
  ) {
    const userId = options.user;
    const user = await interaction.guild.members.fetch(userId);

    const { amount, reason } = options;
    const { level } = await this.xpService.removeXp(userId, amount, reason);

    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setDescription(
        `경험치를 ${user.user.username}님에게 ${amount}만큼 제거했습니다.`,
      )
      .setFields(
        {
          name: '제거 경험치',
          value: `${amount}`,
          inline: true,
        },
        {
          name: '총 경험치',
          value: `${level.totalXp}`,
          inline: true,
        },
        {
          name: '현재 레벨',
          value: `${level.currentLevel}`,
          inline: true,
        },
        {
          name: '제거 사유',
          value: reason ?? '없음',
        },
      );

    interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [embed],
    });
  }
}
