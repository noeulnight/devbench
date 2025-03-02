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
import { PointService } from '../point.service';
import { ModalInteractionGuard } from 'src/common/guard/modal-interaction.guard';
import { GrantPointDto } from '../dto/grant-point.dto';

@Command({
  name: 'context-grant-point',
  nameLocalizations: {
    'en-US': 'grant point',
    ko: '포인트 지급',
  },
  type: ApplicationCommandType.User,
  defaultMemberPermissions: [PermissionsBitField.Flags.ModerateMembers],
})
@Injectable()
export class ContextGrantPointCommand {
  constructor(private readonly pointService: PointService) {}

  @Handler()
  async handle(@InteractionEvent() interaction: ContextMenuCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId(`grant-point-${interaction.user.id}`)
      .setTitle('포인트 지급');

    const userIdInput = new TextInputBuilder()
      .setCustomId('userId')
      .setLabel('지급할 유저')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(interaction.targetId);

    const amountInput = new TextInputBuilder()
      .setCustomId('amount')
      .setLabel('지급할 포인트 수량')
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
    @InteractionEvent(ModalFieldsTransformPipe) dto: GrantPointDto,
  ) {
    const [modal] = eventArgs;
    if (!modal.isModalSubmit()) return;
    if (modal.customId !== `grant-point-${interaction.user.id}`) return;

    const { amount, reason, userId } = dto;
    const user = await interaction.guild.members.fetch(userId);

    await this.pointService.addPoint({
      userId: user.id,
      amount,
      reason,
    });
    const point = await this.pointService.getUserPoint(user.id);

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(
        `포인트를 ${user.user.username}님에게 ${amount}만큼 지급했습니다.`,
      )
      .setFields(
        {
          name: '지급 포인트',
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
