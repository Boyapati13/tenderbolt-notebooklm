import { NextRequest, NextResponse } from 'next/server';

// Slack API integration
export async function POST(request: NextRequest) {
  try {
    const { credentials } = await request.json();
    
    // Test Slack connection
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.botToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Slack authentication failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Slack connected successfully',
      team: data.team,
      user: data.user,
    });
  } catch (error) {
    console.error('Slack connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Slack' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botToken = searchParams.get('botToken');

    if (!botToken) {
      return NextResponse.json(
        { success: false, error: 'Slack bot token not provided' },
        { status: 401 }
      );
    }

    // Get channels list
    const channelsResponse = await fetch('https://slack.com/api/conversations.list', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        types: 'public_channel,private_channel',
        limit: 100,
      }),
    });

    const channelsData = await channelsResponse.json();

    if (!channelsData.ok) {
      throw new Error(channelsData.error || 'Failed to fetch channels');
    }

    const channels = channelsData.channels.map((channel: any) => ({
      id: channel.id,
      name: channel.name,
      isPrivate: channel.is_private,
      isMember: channel.is_member,
      topic: channel.topic?.value || '',
      purpose: channel.purpose?.value || '',
    }));

    return NextResponse.json({
      success: true,
      channels,
    });
  } catch (error) {
    console.error('Slack channels fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Slack channels' },
      { status: 500 }
    );
  }
}

// Send notification to Slack
export async function PUT(request: NextRequest) {
  try {
    const { channel, message, botToken } = await request.json();

    if (!botToken || !channel || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        text: message,
        username: 'Syntara Tenders AI',
        icon_emoji: ':robot_face:',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Failed to send Slack message');
    }

    return NextResponse.json({
      success: true,
      message: 'Slack notification sent successfully',
      timestamp: data.ts,
    });
  } catch (error) {
    console.error('Slack notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send Slack notification' },
      { status: 500 }
    );
  }
}
