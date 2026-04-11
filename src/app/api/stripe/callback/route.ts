import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');
  const errorDescription = req.nextUrl.searchParams.get('error_description');
  
  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/settings?stripe_error=${encodeURIComponent(errorDescription || error)}`, req.url)
    );
  }
  
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/admin/settings?stripe_error=Missing parameters', req.url)
    );
  }
  
  try {
    // Verify state
    const oauthState = await prisma.siteConfig.findUnique({
      where: { key: 'stripe_oauth_state' },
    });
    
    if (!oauthState) {
      return NextResponse.redirect(
        new URL('/admin/settings?stripe_error=Invalid state', req.url)
      );
    }
    
    const stateData = JSON.parse(oauthState.value);
    
    // Check state is recent (within 10 minutes)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/admin/settings?stripe_error=State expired', req.url)
      );
    }
    
    // Delete state
    await prisma.siteConfig.delete({
      where: { key: 'stripe_oauth_state' },
    }).catch(() => {});
    
    // Get secret key
    const stripeSetup = await prisma.siteConfig.findUnique({
      where: { key: 'stripe_setup' },
    });
    
    if (!stripeSetup) {
      return NextResponse.redirect(
        new URL('/admin/settings?stripe_error=Stripe not configured', req.url)
      );
    }
    
    const setup = JSON.parse(stripeSetup.value);
    
    // Exchange code for token
    const response = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_secret: setup.secretKey,
        code,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!response.ok) {
      const errBody = await response.text();
      console.error('[Stripe] Token exchange failed:', errBody);
      return NextResponse.redirect(
        new URL('/admin/settings?stripe_error=Token exchange failed', req.url)
      );
    }
    
    const tokenData = await response.json();
    
    if (!tokenData.stripe_user_id) {
      return NextResponse.redirect(
        new URL('/admin/settings?stripe_error=Invalid response', req.url)
      );
    }
    
    // Save connect data
    const connectData = {
      accountId: tokenData.stripe_user_id,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      publishableKey: tokenData.stripe_publishable_key,
      livemode: tokenData.livemode,
      scope: tokenData.scope,
      connectedAt: new Date().toISOString(),
      platformFeePercent: 1.0,
    };
    
    await prisma.siteConfig.upsert({
      where: { key: 'stripe_connect' },
      update: { value: JSON.stringify(connectData) },
      create: { key: 'stripe_connect', value: JSON.stringify(connectData) },
    });
    
    return NextResponse.redirect(
      new URL('/admin/settings?stripe_success=connected', req.url)
    );
  } catch (err) {
    console.error('[Stripe] Callback error:', err);
    return NextResponse.redirect(
      new URL('/admin/settings?stripe_error=Internal error', req.url)
    );
  }
}