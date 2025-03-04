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
    const userId = options.user;
    const user = await interaction.guild.members.fetch(userId);

    const { amount, reason } = options;
    const { level } = await this.xpService.addXp(userId, amount, reason);

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(
        `경험치를 ${user.user.username}님에게 ${amount}만큼 지급했습니다.`,
      )
      .setFields(
        {
          name: '지급 경험치',
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
          name: '지급 사유',
          value: reason ?? '없음',
        },
      );

    interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [embed],
    });
  }
}
