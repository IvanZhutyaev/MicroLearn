import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(@Body() createDto: CreatePaymentIntentDto, @Req() req) {
    return this.paymentsService.createPaymentIntent(req.user.id, createDto);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(@Body('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.confirmPayment(paymentIntentId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(@Req() req) {
    return this.paymentsService.getPaymentHistory(req.user.id);
  }

  @Post('refund/:id')
  @UseGuards(JwtAuthGuard)
  async requestRefund(@Param('id') paymentId: string, @Req() req) {
    return this.paymentsService.requestRefund(paymentId, req.user.id);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }
}

