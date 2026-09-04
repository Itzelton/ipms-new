import { Body, Controller, Headers, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Post('supabase-auth')
  @HttpCode(HttpStatus.OK)
  async handleSupabaseAuthEvent(
    @Headers('x-webhook-secret') secret: string,
    @Body() body: any,
  ) {
    const expected = process.env.SUPABASE_WEBHOOK_SECRET;
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    // Only act on DELETE events on the auth.users table
    if (body?.type !== 'DELETE' || body?.table !== 'users' || body?.schema !== 'auth') {
      return { received: true };
    }

    const supabaseId: string | undefined = body?.old_record?.id;
    if (!supabaseId) return { received: true };

    // Soft-delete the matching user in our database
    await this.prisma.user.updateMany({
      where: { id: supabaseId, deletedAt: null },
      data: { isActive: false, deletedAt: new Date() },
    });

    return { received: true };
  }
}
