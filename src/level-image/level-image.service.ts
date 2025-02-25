import { Injectable } from '@nestjs/common';
import {
  createCanvas,
  loadImage,
  registerFont,
  CanvasRenderingContext2D,
} from 'canvas';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class LevelImageService {
  constructor() {
    this.registerFont();
  }

  private registerFont() {
    const fontPath = path.join(process.cwd(), 'static', 'font');

    registerFont(path.join(fontPath, 'NotoSansKR-Regular.ttf'), {
      family: 'Noto Sans KR',
    });
    registerFont(path.join(fontPath, 'NotoSansKR-Bold.ttf'), {
      family: 'Noto Sans KR',
      weight: 'bold',
    });
  }

  private async drawBaseImage(ctx: CanvasRenderingContext2D) {
    const baseImagePath = path.join(process.cwd(), 'static', 'base.png');
    const baseImage = await loadImage(baseImagePath);
    ctx.drawImage(baseImage, 0, 0);
  }

  private async drawAvatar(ctx: CanvasRenderingContext2D, avatarUrl: string) {
    const response = await fetch(avatarUrl);
    if (!response.ok) throw new Error('Failed to fetch avatar image');

    const webpBuffer = await response.arrayBuffer();
    const pngBuffer = await sharp(Buffer.from(webpBuffer))
      .toFormat('png')
      .toBuffer();

    const avatarImage = await loadImage(pngBuffer);

    const x = 464,
      y = 30,
      size = 106;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImage, x, y, size, size);
    ctx.restore();
  }

  private drawTitleText(
    ctx: CanvasRenderingContext2D,
    nickname: string,
    level: number,
    isLevelUp: boolean,
  ) {
    ctx.font = 'bold 30px "Noto Sans KR"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      `${nickname.length > 10 ? nickname.slice(0, 10) + '...' : nickname}님${isLevelUp ? '이' : '은'}`,
      30,
      100,
    );
    ctx.fillText(
      `${level}레벨${isLevelUp ? '을 달성하였습니다!' : ' 입니다!'}`,
      30,
      135,
    );
  }

  private drawLevelProgressText(
    ctx: CanvasRenderingContext2D,
    level: number,
    nextLevel: number,
    currentXp: number,
    nextXp: number,
  ) {
    ctx.font = '18px "Noto Sans KR"';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`${nextLevel}레벨까지 남은 XP`, 30, 178);

    ctx.textAlign = 'right';
    ctx.fillText(`${currentXp}XP / ${nextXp}XP`, 450, 178);
  }

  private drawXpBar(
    ctx: CanvasRenderingContext2D,
    currentXp: number,
    nextXp: number,
  ) {
    const totalLevelBoxWidth = 421;

    const xpPercentage = currentXp > nextXp ? 100 : (currentXp / nextXp) * 100;
    const xpWidth = (totalLevelBoxWidth * xpPercentage) / 100;
    if (xpWidth <= 0) return;

    const x = 29,
      y = 184,
      width = xpWidth,
      height = 36,
      radius = 8;
    const fillColor = 'rgba(62, 62, 191, 0.6)';

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
  }

  public async generateLevelImage({
    nickname,
    currentLevel,
    nextLevel,
    avatarUrl,
    currentXp,
    nextXp,
    isLevelUp = true,
  }: {
    nickname: string;
    currentLevel: number;
    nextLevel: number;
    avatarUrl: string;
    currentXp: number;
    nextXp: number;
    isLevelUp?: boolean;
  }) {
    const canvas = createCanvas(600, 250);
    const ctx = canvas.getContext('2d');

    await this.drawBaseImage(ctx);
    await this.drawAvatar(ctx, avatarUrl);
    this.drawTitleText(ctx, nickname, currentLevel, isLevelUp);
    this.drawLevelProgressText(ctx, currentLevel, nextLevel, currentXp, nextXp);
    this.drawXpBar(ctx, currentXp, nextXp);

    return canvas.toBuffer();
  }
}
