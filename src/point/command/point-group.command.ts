import { Command } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { PermissionsBitField } from 'discord.js';
import { GrantPointCommand } from './grant-point.command';
import { RevokePointCommand } from './revoke-point.command';

@Command({
  name: 'point-group',
  nameLocalizations: {
    'en-US': 'point',
    ko: '포인트',
  },
  description: '포인트 관리 명령어입니다.',
  descriptionLocalizations: {
    'en-US': 'point management command',
    ko: '포인트 관리 명령어입니다.',
  },
  defaultMemberPermissions: [PermissionsBitField.Flags.ModerateMembers],
  include: [GrantPointCommand, RevokePointCommand],
})
@Injectable()
export class PointGroupCommand {}
