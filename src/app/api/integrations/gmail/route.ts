import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Gmail API integration
export async function POST(request: NextRequest) {
  try {
    const { credentials } = await request.json();
    
    // Initialize Gmail API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Test connection by getting profile
    const profile = await gmail.users.getProfile({ userId: 'me' });

    return NextResponse.json({
      success: true,
      message: 'Gmail connected successfully',
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
    });
  } catch (error) {
    console.error('Gmail connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Gmail' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const labels = searchParams.get('labels') || 'INBOX';
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    const query = searchParams.get('q') || '';

    // Get credentials from request headers or session
    const credentials = {
      accessToken: request.headers.get('x-google-access-token'),
      refreshToken: request.headers.get('x-google-refresh-token'),
    };

    if (!credentials.accessToken || !credentials.refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Gmail credentials not found' },
        { status: 401 }
      );
    }

    // Initialize Gmail API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // List messages
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      labelIds: labels.split(','),
      maxResults,
      q: query,
    });

    const messages = messagesResponse.data.messages || [];
    const detailedMessages = [];

    // Get detailed information for each message
    for (const message of messages.slice(0, 10)) { // Limit to 10 for performance
      try {
        const messageDetail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        });

        const headers = messageDetail.data.payload?.headers || [];
        const from = headers.find(h => h.name === 'From')?.value || '';
        const to = headers.find(h => h.name === 'To')?.value || '';
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        detailedMessages.push({
          id: message.id,
          threadId: message.threadId,
          from,
          to,
          subject,
          date,
          snippet: messageDetail.data.snippet,
          labelIds: messageDetail.data.labelIds,
        });
      } catch (error) {
        console.error(`Failed to get message ${message.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      emails: detailedMessages,
      nextPageToken: messagesResponse.data.nextPageToken,
    });
  } catch (error) {
    console.error('Gmail sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync Gmail messages' },
      { status: 500 }
    );
  }
}
