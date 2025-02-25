import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { CommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { LevelService } from '../level.service';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { LevelOptions } from '../option/level.options';

@Command({
  name: 'level',
  nameLocalizations: {
    'en-US': 'level',
    ko: '레벨',
  },
  description: '레벨을 확인합니다.',
  descriptionLocalizations: {
    'en-US': 'Check level',
    ko: '레벨을 확인합니다.',
  },
})
@Injectable()
export class LevelCommand {
  constructor(private readonly levelService: LevelService) {}

  @Handler()
  async onRegistration(
    @InteractionEvent() interaction: CommandInteraction,
    @InteractionEvent(SlashCommandPipe) options: LevelOptions,
  ) {
    const user: GuildMember = options.user
      ? await interaction.guild.members.fetch(options.user)
      : (interaction.member as GuildMember);

    const { attachment, embed } = await this.levelService.getLevelEmbedByUser(
      user,
      options.level,
    );

    interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [embed],
      files: [attachment],
    });
  }
}
