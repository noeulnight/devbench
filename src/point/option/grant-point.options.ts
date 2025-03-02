import { Param, ParamType } from '@discord-nestjs/core';

export class GrantPointOptions {
  @Param({
    description: '포인트를 지급할 유저',
    descriptionLocalizations: {
      'en-US': 'User to grant point',
      ko: '포인트를 지급할 유저',
    },
    nameLocalizations: {
      'en-US': 'user',
      ko: '유저',
    },
    required: true,
    type: ParamType.USER,
  })
  user: string;

  @Param({
    description: '지급할 포인트',
    descriptionLocalizations: {
      'en-US': 'Amount of point to grant',
      ko: '지급할 포인트',
    },
    nameLocalizations: {
      'en-US': 'point',
      ko: '포인트',
    },
    required: true,
    type: ParamType.NUMBER,
  })
  amount: number;

  @Param({
    description: '지급 사유',
    descriptionLocalizations: {
      'en-US': 'reason',
      ko: '사유',
    },
    nameLocalizations: {
      'en-US': 'reason',
      ko: '사유',
    },
    required: false,
    type: ParamType.STRING,
  })
  reason?: string;
}
