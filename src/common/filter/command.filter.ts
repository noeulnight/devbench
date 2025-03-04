import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { DiscordException } from '../exception/discord.exception';
import { BotException } from 'src/user/exception/user.exception';

@Catch(DiscordException)
export class CommandExceptionFilter implements ExceptionFilter {
  async catch(exception: BotException, host: ArgumentsHost): Promise<void> {
    const interaction = host.getArgByIndex(0) as CommandInteraction;

    const embeds = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('🚨 오류가 발생했습니다.')
      .setDescription(exception.message);

    if (interaction.isRepliable()) {
      interaction.reply({
        embeds: [embeds],
        flags: [MessageFlags.Ephemeral],
      });
    }
  }
}
