import { Command } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { PersonalChannelInfoCommand } from './personal-channel-info.command';

@Command({
  name: 'personal-channel',
  nameLocalizations: {
    'en-US': 'personal-channel',
    ko: '개인채널',
  },
  description: '개인 채널 관리',
  descriptionLocalizations: {
    'en-US': 'personal channel management',
    ko: '개인 채널 관리',
  },
  include: [PersonalChannelInfoCommand],
})
@Injectable()
export class PersonalChannelCommand {}
