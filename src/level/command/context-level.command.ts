import { Command, Handler } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  ApplicationCommandType,
  ContextMenuCommandInteraction,
  GuildMember,
  MessageFlags,
} from 'discord.js';
import { LevelService } from '../level.service';

@Command({
  name: 'level-context',
  nameLocalizations: {
    'en-US': 'level',
    ko: '레벨',
  },
  type: ApplicationCommandType.User,
})
@Injectable()
export class ContextLevelCommand {
  constructor(private readonly levelService: LevelService) {}

  @Handler()
  async onRegistration(interaction: ContextMenuCommandInteraction) {
    const user: GuildMember = await interaction.guild.members.fetch(
      interaction.targetId,
    );

    const { attachment, embed } =
      await this.levelService.getLevelEmbedByUser(user);

    interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [embed],
      files: [attachment],
    });
  }
}
