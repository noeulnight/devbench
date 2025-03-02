import { ModalFieldsTransformPipe } from '@discord-nestjs/common';
import {
  Command,
  EventParams,
  Handler,
  InteractionEvent,
  On,
} from '@discord-nestjs/core';
import { Injectable, UseGuards } from '@nestjs/common';
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ClientEvents,
  Colors,
  ContextMenuCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionsBitField,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { XpService } from '../xp.service';
import { ModalInteractionGuard } from 'src/common/guard/modal-interaction.guard';
import { GrantXpDto } from '../dto/grant-xp.dto';

@Command({
  name: 'context-grant-xp',
  nameLocalizations: {
    'en-US': 'grant xp',
    ko: '경험치 지급',
  },
  type: ApplicationCommandType.User,
  defaultMemberPermissions: [PermissionsBitField.Flags.ModerateMembers],
})
@Injectable()
export class ContextGrantXpCommand {
  constructor(private readonly xpService: XpService) {}

  @Handler()
  async handle(@InteractionEvent() interaction: ContextMenuCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId(`grant-xp-${interaction.user.id}`)
      .setTitle('경험치 지급');

    const userIdInput = new TextInputBuilder()
      .setCustomId('userId')
      .setLabel('지급할 유저')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(interaction.targetId);

    const amountInput = new TextInputBuilder()
      .setCustomId('amount')
      .setLabel('지급할 경험치 수량')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('지급 이유')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const modalRow = [userIdInput, amountInput, reasonInput].map((input) =>
      new ActionRowBuilder<TextInputBuilder>().addComponents(input),
    );

    modal.addComponents(...modalRow);

    await interaction.showModal(modal);
  }

  @On('interactionCreate')
  @UseGuards(ModalInteractionGuard)
  async onModalSubmit(
    @InteractionEvent() interaction: ModalSubmitInteraction,
    @EventParams() eventArgs: ClientEvents['interactionCreate'],
    @InteractionEvent(ModalFieldsTransformPipe) dto: GrantXpDto,
  ) {
    const [modal] = eventArgs;
    if (!modal.isModalSubmit()) return;
    if (modal.customId !== `grant-xp-${interaction.user.id}`) return;

    const { amount, reason, userId } = dto;
    const user = await interaction.guild.members.fetch(userId);

    const { level } = await this.xpService.addXp(user, amount, reason);
    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(
        `경험치를 ${user.user.username}님에게 ${amount}만큼 지급했습니다.`,
      )
      .setFields(
        {
          name: '지급 경험치',
          value: `${amount}`,
          inline: true,
        },
        {
          name: '총 경험치',
          value: `${level.totalXp}`,
          inline: true,
        },
        {
          name: '현재 레벨',
          value: `${level.currentLevel}`,
          inline: true,
        },
        {
          name: '지급 사유',
          value: reason ?? '없음',
        },
      );

    interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [embed],
    });
  }
}
