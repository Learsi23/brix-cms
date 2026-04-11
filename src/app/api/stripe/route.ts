import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action');
  
  try {
    switch (action) {
      case 'status': {
        const stripeConnect = await prisma.siteConfig.findUnique({
          where: { key: 'stripe_connect' },
        });
        if (!stripeConnect) {
          return NextResponse.json({ connected: false });
        }
        const data = JSON.parse(stripeConnect.value);
        return NextResponse.json({
          connected: true,
          ...data,
        });
      }
      
      case 'setup': {
        const stripeSetup = await prisma.siteConfig.findUnique({
          where: { key: 'stripe_setup' },
        });
        if (!stripeSetup) {
          return NextResponse.json({ configured: false });
        }
        const data = JSON.parse(stripeSetup.value);
        return NextResponse.json({
          configured: true,
          clientId: data.clientId,
          // Don't return secret key
        });
      }
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    console.error('[Stripe] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/stripe/setup - Save Stripe Client ID and Secret Key
export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action');
  
  try {
    const body = await req.json();
    
    switch (action) {
      case 'saveSetup': {
        const { clientId, secretKey } = body;
        
        if (!clientId || !clientId.startsWith('ca_')) {
          return NextResponse.json({ 
            error: 'Client ID must start with "ca_"' 
          }, { status: 400 });
        }
        
        if (!secretKey || (!secretKey.startsWith('sk_live_') && !secretKey.startsWith('sk_test_'))) {
          return NextResponse.json({ 
            error: 'Secret Key must start with "sk_live_" or "sk_test_"' 
          }, { status: 400 });
        }
        
        const setupData = {
          clientId,
          secretKey,
          savedAt: new Date().toISOString(),
        };
        
        await prisma.siteConfig.upsert({
          where: { key: 'stripe_setup' },
          update: { value: JSON.stringify(setupData) },
          create: { key: 'stripe_setup', value: JSON.stringify(setupData) },
        });
        
        return NextResponse.json({ success: true });
      }
      
      case 'direct': {
        const { secretKey, accountId } = body;
        
        if (!secretKey || !secretKey.startsWith('sk_')) {
          return NextResponse.json({ 
            error: 'Invalid secret key' 
          }, { status: 400 });
        }
        
        if (!accountId || !accountId.startsWith('acct_')) {
          return NextResponse.json({ 
            error: 'Account ID must start with "acct_"' 
          }, { status: 400 });
        }
        
        // Verify the account works
        const stripe = await import('stripe');
        const stripeClient = new stripe.default.default(secretKey);
        
        try {
          const account = await stripeClient.accounts.retrieve(accountId);
          
          const connectData = {
            accountId,
            accessToken: secretKey,
            livemode: secretKey.startsWith('sk_live_'),
            connectedAt: new Date().toISOString(),
            platformFeePercent: 1.0,
          };
          
          await prisma.siteConfig.upsert({
            where: { key: 'stripe_connect' },
            update: { value: JSON.stringify(connectData) },
            create: { key: 'stripe_connect', value: JSON.stringify(connectData) },
          });
          
          return NextResponse.json({ 
            success: true, 
            livemode: connectData.livemode,
            accountId,
          });
        } catch (stripeErr: any) {
          return NextResponse.json({ 
            error: 'Failed to connect: ' + (stripeErr.message || 'Invalid credentials') 
          }, { status: 400 });
        }
      }
      
      case 'disconnect': {
        await prisma.siteConfig.delete({
          where: { key: 'stripe_connect' },
        }).catch(() => {});
        
        return NextResponse.json({ success: true });
      }
      
      case 'oauth': {
        // Get setup to retrieve clientId
        const stripeSetup = await prisma.siteConfig.findUnique({
          where: { key: 'stripe_setup' },
        });
        
        if (!stripeSetup) {
          return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
        }
        
        const setup = JSON.parse(stripeSetup.value);
        const state = crypto.randomUUID();
        
        // Store state in session temporarily (simplified - in production use proper session)
        const oauthData = {
          state,
          timestamp: Date.now(),
        };
        
        await prisma.siteConfig.upsert({
          where: { key: 'stripe_oauth_state' },
          update: { value: JSON.stringify(oauthData) },
          create: { key: 'stripe_oauth_state', value: JSON.stringify(oauthData) },
        });
        
        const baseUrl = req.nextUrl.origin;
        const redirectUri = `${baseUrl}/api/stripe/callback`;
        
        const oauthUrl = `https://connect.stripe.com/oauth/authorize` +
          `?response_type=code` +
          `&client_id=${setup.clientId}` +
          `&scope=read_write` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&state=${state}`;
        
        return NextResponse.json({ oauthUrl });
      }
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    console.error('[Stripe] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}