import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const stripeSession = req.nextUrl.searchParams.get('stripe_session');
    if (!stripeSession) {
      return NextResponse.redirect(new URL('/cart', req.url));
    }

    const stripe = await import('stripe');
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.redirect(new URL('/cart', req.url));
    }

    const stripeClient = new stripe.default.default(stripeKey);
    const strSession = await stripeClient.checkout.sessions.retrieve(stripeSession);

    if (strSession.payment_status !== 'paid' || strSession.status !== 'complete') {
      return NextResponse.redirect(new URL('/cart', req.url));
    }

    const meta = strSession.metadata || {};
    const cartSessionId = meta.session_id || '';
    const isRestaurant = meta.is_restaurant === 'true';
    const restaurantName = meta.restaurant_name || '';
    const customerEmail = strSession.customer_email || (strSession as any).customer_details?.email || '';
    const currency = strSession.currency?.toUpperCase() || 'SEK';
    const totalAmount = (strSession.amount_total || 0) / 100;

    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId: cartSessionId },
      include: { product: true },
    });

    const items = cartItems
      .filter(ci => ci.product)
      .map(ci => ({
        name: ci.product!.name,
        price: ci.product!.price,
        qty: ci.quantity,
      }));

    for (const ci of cartItems) {
      if (ci.product) {
        ci.product.stock = Math.max(0, ci.product.stock - ci.quantity);
        await prisma.product.update({
          where: { id: ci.productId },
          data: { stock: ci.product.stock },
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        sessionId: cartSessionId,
        stripeSessionId: stripeSession,
        customerEmail,
        totalAmount,
        currency,
        status: 'paid',
        itemsJson: JSON.stringify({
          items,
          isRestaurant,
          restaurantName,
        }),
        isRestaurant,
        restaurantName: isRestaurant ? restaurantName : null,
      },
    });

    await prisma.cartItem.deleteMany({ where: { sessionId: cartSessionId } });

    const orderRef = order.id.substring(0, 8).toUpperCase();

    if (isRestaurant && meta.notif_ntfy) {
      try {
        const lines = items.map(i => `- ${i.name} x${i.qty}  ${i.price * i.qty.toFixed(2)} ${currency}`);
        const body =
          `Order #${orderRef}\n` +
          (customerEmail ? `Customer: ${customerEmail}\n` : '') +
          `\n${lines.join('\n')}\n\n` +
          `TOTAL: ${totalAmount.toFixed(2)} ${currency}`;

        await fetch(`https://ntfy.sh/${meta.notif_ntfy}`, {
          method: 'POST',
          headers: {
            'Title': `New order - ${restaurantName}`,
            'Priority': 'high',
            'Tags': 'bell,fork_and_knife',
          },
          body,
        });
      } catch (ntfyErr) {
        console.error('Ntfy notification failed:', ntfyErr);
      }
    }

    return NextResponse.redirect(new URL(`/checkout/success?orderRef=${orderRef}`, req.url));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}