import { DiscordException } from 'src/common/exception/discord.exception';

/**
 * 사용자 유형이 봇일 경우 조회할 수 없습니다.
 */
export class BotException extends DiscordException {
  constructor() {
    super('사용자 유형이 봇일 경우 조회할 수 없습니다.', 403);
  }
}

export class UserNotFoundException extends DiscordException {
  constructor() {
    super('존재하지 않는 유저입니다.', 404);
  }
}
