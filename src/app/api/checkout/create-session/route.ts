import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function getStripeConnectData() {
  const config = await prisma.siteConfig.findUnique({
    where: { key: 'stripe_connect' },
  });
  if (!config) return null;
  return JSON.parse(config.value);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionKey, isRestaurant, restaurantName, ntfyTopic } = body;

    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId: sessionKey },
      include: { product: true },
    });

    if (!cartItems.length) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    // Check for Stripe Connect
    const connectData = await getStripeConnectData();
    let stripeKey: string;
    let stripeClient: any;
    
    if (connectData?.accessToken) {
      // Use connected account
      stripeKey = connectData.accessToken;
      stripeClient = new (await import('stripe')).default.default(stripeKey);
    } else {
      // Use regular Stripe key
      stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 });
      }
      stripeClient = new (await import('stripe')).default.default(stripeKey);
    }

    // Calculate total for platform fee
    let totalAmount = 0;
    const lineItems: any[] = [];
    for (const item of cartItems) {
      const itemTotal = item.product!.price * item.quantity;
      totalAmount += itemTotal;
      if (item.product?.stripePriceId) {
        lineItems.push({
          price: item.product.stripePriceId,
          quantity: item.quantity,
        });
      } else {
        lineItems.push({
          price_data: {
            unit_amount: Math.round(item.product!.price * 100),
            currency: 'sek',
            product_data: {
              name: item.product!.name,
              description: item.product!.description?.substring(0, 500) || undefined,
            },
          },
          quantity: item.quantity,
        });
      }
    }

    const metadata: Record<string, string> = {
      session_id: sessionKey,
      is_restaurant: isRestaurant ? 'true' : 'false',
      restaurant_name: restaurantName?.trim() || '',
    };
    if (ntfyTopic?.trim()) {
      metadata.notif_ntfy = ntfyTopic.trim();
    }

    // Build session options
    const sessionOptions: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/checkout/success?stripe_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/cart`,
      metadata,
    };

    // Add Stripe Connect parameters if connected
    if (connectData?.accountId) {
      sessionOptions.payment_intent_data = {
        application_fee_amount: Math.round(totalAmount * (connectData.platformFeePercent || 1) * 100) / 100,
        transfer_data: {
          destination: connectData.accountId,
        },
      };
    }

    const session = await stripeClient.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    console.error('[Checkout] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}