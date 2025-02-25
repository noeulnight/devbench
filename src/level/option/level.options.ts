import { Param, ParamType } from '@discord-nestjs/core';

export class LevelOptions {
  @Param({
    description: '레벨을 확인할 유저',
    descriptionLocalizations: {
      'en-US': 'User to check level',
      ko: '레벨을 확인할 유저',
    },
    nameLocalizations: {
      'en-US': 'user',
      ko: '유저',
    },
    required: false,
    type: ParamType.USER,
  })
  user: string;

  @Param({
    description: '레벨까지 필요한 XP 확인',
    descriptionLocalizations: {
      'en-US': 'Check remaining XP to level',
      ko: '레벨까지 필요한 XP 확인',
    },
    nameLocalizations: {
      'en-US': 'level',
      ko: '레벨',
    },
    required: false,
    type: ParamType.NUMBER,
  })
  level: number;
}
