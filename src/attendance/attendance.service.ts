import { Injectable } from '@nestjs/common';

import {
  differenceInCalendarDays,
  isSameDay,
  startOfDay,
  subDays,
} from 'date-fns';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AlreadyCheckedAttendanceException } from './exception/attendance.exception';
import { XpService } from 'src/xp/xp.service';
import { PointService } from 'src/point/point.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly xpService: XpService,
    private readonly pointService: PointService,
  ) {}

  public async getAttendanceStreak(userId: string) {
    const user = await this.userService.getUserById(userId);
    return user.attendanceStreak;
  }

  private getEffectiveAttendanceDate(date: Date): Date {
    return startOfDay(date.getHours() < 15 ? subDays(date, 1) : date);
  }

  public async checkAttendance(userId: string) {
    const nowUTC = new Date();
    const effectiveToday = this.getEffectiveAttendanceDate(nowUTC);

    const streak = await this.prismaService.$transaction(async (tx) => {
      const lastAttendance = await tx.attendanceHistory.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      });

      if (lastAttendance) {
        const lastEffectiveDate = this.getEffectiveAttendanceDate(
          lastAttendance.date,
        );

        if (isSameDay(effectiveToday, lastEffectiveDate))
          throw new AlreadyCheckedAttendanceException();
      }

      await tx.attendanceHistory.create({
        data: { userId, date: nowUTC },
      });

      if (lastAttendance) {
        const lastEffectiveDate = this.getEffectiveAttendanceDate(
          new Date(lastAttendance.date),
        );

        if (differenceInCalendarDays(effectiveToday, lastEffectiveDate) === 1) {
          const streak = await tx.user.update({
            where: { id: userId },
            data: { attendanceStreak: { increment: 1 } },
          });
          return streak.attendanceStreak;
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: { attendanceStreak: 1 },
      });
      return 1;
    });

    await this.xpService.addXp({
      userId,
      amount: 100,
      reason: '출석체크',
    });
    await this.pointService.addPoint({
      userId,
      amount: 100,
      reason: '출석체크',
    });

    return streak;
  }
}
