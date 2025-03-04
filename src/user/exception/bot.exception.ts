import { DiscordException } from 'src/common/exception/discord.exception';

export class BotException extends DiscordException {
  constructor() {
    super('사용자 유형이 봇일 경우 조회할 수 없습니다.', 403);
  }
}
