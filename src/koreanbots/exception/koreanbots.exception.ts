import { DiscordException } from 'src/common/exception/discord.exception';

export class KoreanBotsException extends DiscordException {
  constructor() {
    super('한디리에서 예기지 못한 오류가 발생했습니다.', 500);
  }
}

export class KoreanBotsAlreadyHeartException extends DiscordException {
  constructor() {
    super('이미 보상을 받았습니다.', 400);
  }
}
