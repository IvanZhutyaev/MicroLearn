import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createPaymentIntent(userId: string, createDto: CreatePaymentIntentDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: createDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.price === 0) {
      throw new BadRequestException('Course is free');
    }

    // Check if user already purchased the course
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        userId,
        courseId: createDto.courseId,
        status: 'completed',
      },
    });

    if (existingPayment) {
      throw new BadRequestException('Course already purchased');
    }

    // TODO: Apply promo code discount if provided

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(course.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        courseId: course.id,
      },
    });

    // Create payment record
    await this.prisma.payment.create({
      data: {
        userId,
        courseId: course.id,
        amount: course.price,
        currency: 'USD',
        status: 'pending',
        stripePaymentId: paymentIntent.id,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not completed');
    }

    const userId = paymentIntent.metadata.userId;
    const courseId = paymentIntent.metadata.courseId;

    // Update payment status
    await this.prisma.payment.updateMany({
      where: {
        stripePaymentId: paymentIntentId,
      },
      data: {
        status: 'completed',
      },
    });

    return {
      message: 'Payment confirmed',
      courseId,
    };
  }

  async getPaymentHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async requestRefund(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('You can only refund your own payments');
    }

    if (payment.status !== 'completed') {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    if (payment.stripePaymentId && this.stripe) {
      try {
        await this.stripe.refunds.create({
          payment_intent: payment.stripePaymentId,
        });

        await this.prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'refunded',
          },
        });

        return { message: 'Refund processed successfully' };
      } catch (error) {
        throw new BadRequestException('Failed to process refund');
      }
    }

    // Manual refund if Stripe is not available
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'refunded',
      },
    });

    return { message: 'Refund request submitted' };
  }

  async handleWebhook(payload: any, signature: string) {
    if (!this.stripe) {
      return;
    }

    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.confirmPayment(paymentIntent.id);
      }

      return { received: true };
    } catch (error) {
      throw new BadRequestException('Webhook signature verification failed');
    }
  }
}

