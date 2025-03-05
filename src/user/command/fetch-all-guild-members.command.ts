import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  CommandInteraction,
  MessageFlags,
  PermissionsBitField,
} from 'discord.js';
import { UserService } from '../user.service';

@Command({
  name: 'fetch-all-guild-members',
  nameLocalizations: {
    'en-US': 'fetch-all-guild-members',
    ko: '맴버강제업데이트',
  },
  description: '서버에 있는 모든 멤버를 업데이트합니다.',
  descriptionLocalizations: {
    'en-US': 'fetch all guild members',
    ko: '서버에 있는 모든 멤버를 업데이트합니다.',
  },
  defaultMemberPermissions: [PermissionsBitField.Flags.ModerateMembers],
})
@Injectable()
export class FetchAllGuildMembersCommand {
  constructor(private readonly userService: UserService) {}

  @Handler()
  async handle(@InteractionEvent() interaction: CommandInteraction) {
    const reply = await interaction.reply({
      content: '맴버 업데이트를 시작합니다.',
      flags: [MessageFlags.Ephemeral],
    });

    const members = await this.userService.fetchAllGuildMembers();

    await reply.edit({
      content: `맴버 업데이트를 완료했습니다. ${members}명의 맴버를 업데이트했습니다.`,
    });
  }
}
