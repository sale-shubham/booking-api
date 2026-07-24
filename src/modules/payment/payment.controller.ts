import { BadRequestException, Controller, Headers, Param, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaymentService } from './payment.service';

@ApiTags('payment')
@Controller()
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  @Post('bookings/:id/pay')
  createOrder(@Param('id') bookingId: string, @CurrentUser() user: AuthUser) {
    return this.payment.createOrder(bookingId, user.userId);
  }

  @Public()
  @Post('payments/webhook')
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Raw body unavailable');
    }
    return this.payment.handleWebhook(req.rawBody, signature);
  }
}
