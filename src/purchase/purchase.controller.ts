import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { User } from '@prisma/client';
import { UserAuthGuard } from 'src/auth/guard/auth.guard';
import { PurchaseService } from './purchase.service';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @UseGuards(UserAuthGuard)
  async purchaseProduct(
    @Body('productId') id: number,
    @CurrentUser() user: User,
  ) {
    return this.purchaseService.purchaseProduct(id, user);
  }

  @Get()
  @UseGuards(UserAuthGuard)
  async getPurchases(@CurrentUser() user: User) {
    const [totalCount, nodes] = await Promise.all([
      this.purchaseService.countPurchasesByUserId(user.id),
      this.purchaseService.getPurchasesByUserId(user.id),
    ]);

    return { nodes, totalCount };
  }

  @Get(':id')
  @UseGuards(UserAuthGuard)
  async getPurchase(@Param('id') id: string, @CurrentUser() user: User) {
    return this.purchaseService.getPurchase(id, user);
  }
}
