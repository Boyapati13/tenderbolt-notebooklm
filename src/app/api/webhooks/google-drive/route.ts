import { NextRequest, NextResponse } from 'next/server';
import { integrationService } from '@/lib/integrations';

// Webhook handler for Google Drive changes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature if needed
    const signature = request.headers.get('x-google-signature');
    if (signature && !verifyGoogleSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Process Google Drive webhook
    if (body.kind === 'api#channel') {
      // Handle file changes
      const files = await integrationService.syncGoogleDrive();
      
      // Notify other services if needed
      const slackConfig = integrationService.getIntegration('slack');
      if (slackConfig?.status === 'connected') {
        await integrationService.sendSlackNotification(
          '#tender-updates',
          `📁 Google Drive sync completed. ${files.length} files processed.`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google Drive webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

function verifyGoogleSignature(body: any, signature: string): boolean {
  // Implement Google webhook signature verification
  // This is a placeholder - implement proper verification
  return true;
}
