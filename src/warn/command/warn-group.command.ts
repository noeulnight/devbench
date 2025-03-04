import { Command } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { PermissionsBitField } from 'discord.js';
import { WarnCommand } from './grant-warn.command';

@Command({
  name: 'warn-group',
  nameLocalizations: {
    'en-US': 'warn',
    ko: '경고',
  },
  description: '경고 관리 명령어',
  descriptionLocalizations: {
    'en-US': 'warn management command',
    ko: '경고 관리 명령어',
  },
  defaultMemberPermissions: [PermissionsBitField.Flags.ModerateMembers],
  include: [WarnCommand],
})
@Injectable()
export class WarnGroupCommand {}
