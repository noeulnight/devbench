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
  Events,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  PermissionsBitField,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { PointService } from '../point.service';
import { ModalInteractionGuard } from 'src/common/guard/modal-interaction.guard';
import { RevokePointDto } from '../dto/revoke-point.dto';

@Command({
  name: 'context-revoke-point',
  nameLocalizations: {
    'en-US': 'revoke point',
    ko: '포인트 제거',
  },
  type: ApplicationCommandType.User,
  defaultMemberPermissions: [PermissionsBitField.Flags.ModerateMembers],
})
@Injectable()
export class ContextRevokePointCommand {
  constructor(private readonly pointService: PointService) {}

  @Handler()
  async handle(@InteractionEvent() interaction: ContextMenuCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId(`revoke-point-${interaction.user.id}`)
      .setTitle('포인트 제거');

    const userIdInput = new TextInputBuilder()
      .setCustomId('userId')
      .setLabel('제거할 유저')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(interaction.targetId);

    const amountInput = new TextInputBuilder()
      .setCustomId('amount')
      .setLabel('제거할 포인트 수량')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('제거 이유')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const modalRow = [userIdInput, amountInput, reasonInput].map((input) =>
      new ActionRowBuilder<TextInputBuilder>().addComponents(input),
    );

    modal.addComponents(...modalRow);

    await interaction.showModal(modal);
  }

  @On(Events.InteractionCreate)
  @UseGuards(ModalInteractionGuard)
  async onModalSubmit(
    @InteractionEvent() interaction: ModalSubmitInteraction,
    @EventParams() eventArgs: ClientEvents['interactionCreate'],
    @InteractionEvent(ModalFieldsTransformPipe) dto: RevokePointDto,
  ) {
    const [modal] = eventArgs;
    if (!modal.isModalSubmit()) return;
    if (modal.customId !== `revoke-point-${interaction.user.id}`) return;

    const { amount, reason, userId } = dto;
    const user = await interaction.guild.members.fetch(userId);

    await this.pointService.usePoint({
      userId: user.id,
      amount,
      reason,
    });
    const point = await this.pointService.getUserPoint(user.id);

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(
        `포인트를 ${user.user.username}님에게 ${amount}만큼 제거했습니다.`,
      )
      .setFields(
        {
          name: '제거 포인트',
          value: `${amount}`,
          inline: true,
        },
        {
          name: '총 포인트',
          value: `${point}`,
          inline: true,
        },
      );

    interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [embed],
    });
  }
}
