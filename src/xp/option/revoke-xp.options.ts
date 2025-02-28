import { Param, ParamType } from '@discord-nestjs/core';

export class RevokeXpOptions {
  @Param({
    description: '경험치를 제거할 유저',
    descriptionLocalizations: {
      'en-US': 'User to revoke xp',
      ko: '경험치를 제거할 유저',
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
    description: '제거할 경험치',
    descriptionLocalizations: {
      'en-US': 'Amount of xp to revoke',
      ko: '제거할 경험치',
    },
    nameLocalizations: {
      'en-US': 'xp',
      ko: '경험치',
    },
    required: true,
    type: ParamType.NUMBER,
  })
  amount: number;

  @Param({
    description: '제거 사유',
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

  @Param({
    description: '경험치와 함께 포인트도 같이 제거할 것인지 여부',
    descriptionLocalizations: {
      'en-US': 'Remove point with xp',
      ko: '경험치와 함께 포인트도 제거할 것인지 여부',
    },
    nameLocalizations: {
      'en-US': 'point',
      ko: '포인트',
    },
    required: false,
    type: ParamType.BOOLEAN,
  })
  point?: boolean;
}
