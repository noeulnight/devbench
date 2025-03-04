import { Param, ParamType } from '@discord-nestjs/core';
import { Transform } from 'class-transformer';

export class WarnOptions {
  @Param({
    description: '경고를 지급할 유저',
    descriptionLocalizations: {
      'en-US': 'User to warn',
      ko: '경고를 지급할 유저',
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
    description: '경고 사유',
    descriptionLocalizations: {
      'en-US': 'Reason of warn',
      ko: '경고 사유',
    },
    nameLocalizations: {
      'en-US': 'reason',
      ko: '사유',
    },
    required: true,
    type: ParamType.STRING,
    autocomplete: true,
  })
  @Transform(({ value }) => parseInt(value))
  reason: number;

  @Param({
    description: '비고',
    descriptionLocalizations: {
      'en-US': 'Note',
      ko: '비고',
    },
    nameLocalizations: {
      'en-US': 'note',
      ko: '비고',
    },
    required: false,
    type: ParamType.STRING,
  })
  note?: string;

  @Param({
    description: '경고 가중치',
    descriptionLocalizations: {
      'en-US': 'Weight of warn',
      ko: '경고 가중치',
    },
    nameLocalizations: {
      'en-US': 'weight',
      ko: '가중치',
    },
    required: false,
    type: ParamType.INTEGER,
  })
  weight?: number;
}
