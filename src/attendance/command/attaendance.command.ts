import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { Colors, CommandInteraction, EmbedBuilder } from 'discord.js';
import { AttendanceService } from '../attendance.service';

@Command({
  name: 'attendance',
  nameLocalizations: {
    'en-US': 'attendance',
    ko: '출석체크',
  },
  description: '출석체크를 합니다.',
  descriptionLocalizations: {
    'en-US': 'check attendance',
    ko: '출석체크를 합니다.',
  },
})
@Injectable()
export class AttendanceCommand {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Handler()
  async handle(@InteractionEvent() interaction: CommandInteraction) {
    const streak = await this.attendanceService.checkAttendance(
      interaction.user.id,
    );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle('✅ 출석체크 완료!')
          .setDescription(`출석체크를 완료했습니다!`)
          .addFields(
            {
              name: '출석체크 일자',
              value: `<t:${Math.floor(new Date().getTime() / 1000)}:D>`,
              inline: true,
            },
            {
              name: '출석체크 연속 기록',
              value: `${streak}일`,
              inline: true,
            },
          ),
      ],
    });
  }
}
