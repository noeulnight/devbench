import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { LeaderboardService } from '../leaderboard.service';

@Command({
  name: 'leaderboard',
  nameLocalizations: {
    'en-US': 'leaderboard',
    ko: '리더보드',
  },
  description: '리더보드를 확인합니다.',
  descriptionLocalizations: {
    'en-US': 'Check leaderboard',
    ko: '리더보드를 확인합니다.',
  },
})
@Injectable()
export class LeaderboardCommand {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Handler()
  async onRegistration(@InteractionEvent() interaction: CommandInteraction) {
    const [nodes, totalCount] = await Promise.all([
      this.leaderboardService.getLeaderboard({}),
      this.leaderboardService.countLeaderboard(),
    ]);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: '디벤치 리더보드',
        iconURL:
          'https://media.discordapp.net/attachments/1343779615579308123/1343840570568867941/image.png',
      })
      .setDescription('디벤치 리더보드입니다.\n5분 간격으로 업데이트 됩니다.')
      .setFields(
        nodes.map((node, index) => {
          return {
            name: `${index + 1}. ${node.user.nickname} (${
              node.rankDifference === 0
                ? '-'
                : node.rankDifference > 0
                  ? `+${node.rankDifference}`
                  : node.rankDifference
            })`,
            value: `${node.level}레벨 (총 ${node.xp.toLocaleString()}XP)`,
          };
        }),
      )
      .setColor(Colors.Gold)
      .setFooter({
        text: `총 ${totalCount}명`,
      })
      .setTimestamp(nodes[0]?.updatedAt ?? new Date());

    interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [embed],
    });
  }
}
