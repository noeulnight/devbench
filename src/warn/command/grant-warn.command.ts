import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Handler,
  InteractionEvent,
  On,
  SubCommand,
} from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  Events,
  Interaction,
} from 'discord.js';
import { WarnOptions } from '../option/warn.options';
import { WarnService } from '../warn.service';

@SubCommand({
  name: 'grant-warn',
  nameLocalizations: {
    'en-US': 'grant',
    ko: '지급',
  },
  description: '경고를 지급할 수 있습니다.',
  descriptionLocalizations: {
    'en-US': 'warn user',
    ko: '경고를 지급할 수 있습니다.',
  },
})
@Injectable()
export class WarnCommand {
  constructor(private readonly warnService: WarnService) {}

  @Handler()
  async handle(
    @InteractionEvent() interaction: CommandInteraction,
    @InteractionEvent(SlashCommandPipe) options: WarnOptions,
  ) {
    const warn = await this.warnService.createWarnHistory(options);

    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('🚨 경고 지급 안내')
      .setDescription(`<@${options.user}>님 지급된 경고 사항을 알려드립니다.`)
      .addFields({
        name: '경고 사유',
        value: warn.warnType.name,
        inline: true,
      })
      .addFields({
        name: '경고 가중치',
        value: warn.weight.toString(),
        inline: true,
      })
      .addFields({
        name: '지급 일시',
        value: warn.createdAt.toLocaleString('ko-KR'),
      })
      .setFooter({
        text: `해당 메시지는 10초 후에 자동으로 삭제됩니다.`,
      });

    const reply = await interaction.reply({
      content: `<@${options.user}> 경고 지급 안내`,
      embeds: [embed],
    });

    setTimeout(async () => {
      await reply.delete();
    }, 10000);
  }

  @On(Events.InteractionCreate)
  async onInteractionCreate(@InteractionEvent() interaction: Interaction) {
    if (!interaction.isAutocomplete()) return;
    if (interaction.options.getSubcommand() !== 'grant-warn') return;

    const focusedOption = interaction.options.getFocused(true);

    const warnTypes = await this.warnService.searchWarnTypes(
      focusedOption.value,
    );

    await interaction.respond(
      warnTypes.map((warnType) => ({
        name: warnType.name,
        value: warnType.id.toString(),
      })),
    );
  }
}
