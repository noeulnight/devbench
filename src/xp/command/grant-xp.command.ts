import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, InteractionEvent, SubCommand } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { GrantXpOptions } from '../option/grant-xp.options';
import { XpService } from '../xp.service';
import { XpTransactionSource } from '@prisma/client';

@SubCommand({
  name: 'grant',
  nameLocalizations: {
    'en-US': 'grant',
    ko: '지급',
  },
  description: '경험치 지급 명령어입니다.',
  descriptionLocalizations: {
    'en-US': 'Grant xp to a user',
    ko: '경험치 지급 명령어입니다.',
  },
})
@Injectable()
export class GrantXpCommand {
  constructor(private readonly xpService: XpService) {}

  @Handler()
  async handle(
    @InteractionEvent() interaction: CommandInteraction,
    @InteractionEvent(SlashCommandPipe) options: GrantXpOptions,
  ) {
    const user = await interaction.guild.members.fetch(options.user);
    const { level } = await this.xpService.addXp(
      user,
      options.amount,
      XpTransactionSource.ADMIN,
      options.reason,
    );

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(
        `경험치를 ${user.user.username}님에게 ${options.amount}만큼 지급했습니다.`,
      )
      .setFields(
        {
          name: '지급 경험치',
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
