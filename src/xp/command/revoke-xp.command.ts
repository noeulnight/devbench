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
import { XpTransactionSource } from '@prisma/client';

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
    const user = await interaction.guild.members.fetch(options.user);
    const { level } = await this.xpService.removeXp(
      user,
      options.amount,
      XpTransactionSource.ADMIN,
      options.reason,
    );

    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setDescription(
        `경험치를 ${user.user.username}님에게 ${options.amount}만큼 제거했습니다.`,
      )
      .setFields(
        {
          name: '제거 경험치',
          value: `${options.amount}`,
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
          name: '지급 사유',
          value: options.reason ?? '없음',
        },
      );

    interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [embed],
    });
  }
}
