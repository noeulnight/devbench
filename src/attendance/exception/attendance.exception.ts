import { DiscordException } from 'src/common/exception/discord.exception';

export class AlreadyCheckedAttendanceException extends DiscordException {
  constructor() {
    super('이미 오늘 출석체크를 완료 했습니다.', 400);
  }
}
