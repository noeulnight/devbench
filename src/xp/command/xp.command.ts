import { Command } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { PermissionsBitField } from 'discord.js';
import { GrantXpCommand } from './grant-xp.command';
import { RevokeXpCommand } from './revoke-xp.command';

@Command({
  name: 'xp',
  nameLocalizations: {
    'en-US': 'xp',
    ko: '경험치',
  },
  description: '경험치 관련 명령어입니다.',
  descriptionLocalizations: {
    'en-US': 'Command related to xp',
    ko: '경험치 관련 명령어입니다.',
  },
  defaultMemberPermissions: [
    PermissionsBitField.Flags.Administrator,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageGuild,
  ],
  include: [GrantXpCommand, RevokeXpCommand],
})
@Injectable()
export class XpCommand {}
