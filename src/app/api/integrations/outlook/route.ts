import { NextRequest, NextResponse } from 'next/server';

// Outlook API integration using Microsoft Graph
export async function POST(request: NextRequest) {
  try {
    const { credentials } = await request.json();
    
    // Test Outlook connection using Microsoft Graph API
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Outlook authentication failed');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Outlook connected successfully',
      user: {
        id: data.id,
        displayName: data.displayName,
        mail: data.mail,
        userPrincipalName: data.userPrincipalName,
      },
    });
  } catch (error) {
    console.error('Outlook connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Outlook' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'Inbox';
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    const accessToken = searchParams.get('accessToken');
    const query = searchParams.get('q') || '';

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Outlook access token not provided' },
        { status: 401 }
      );
    }

    // List messages from specified folder using Microsoft Graph API
    const folderPath = folder === 'Inbox' ? 'inbox' : `mailFolders/${folder}`;
    const queryParam = query ? `&$search="${query}"` : '';
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/${folderPath}/messages?$top=${maxResults}&$orderby=receivedDateTime desc${queryParam}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Outlook messages');
    }

    const data = await response.json();

    const emails = data.value?.map((message: any) => ({
      id: message.id,
      subject: message.subject,
      from: message.from?.emailAddress?.address || '',
      fromName: message.from?.emailAddress?.name || '',
      to: message.toRecipients?.map((r: any) => r.emailAddress?.address).join(', ') || '',
      receivedDateTime: message.receivedDateTime,
      sentDateTime: message.sentDateTime,
      hasAttachments: message.hasAttachments,
      isRead: message.isRead,
      importance: message.importance,
      bodyPreview: message.bodyPreview,
      body: message.body?.content || '',
      bodyType: message.body?.contentType || 'text',
      attachments: message.attachments || [],
    })) || [];

    return NextResponse.json({
      success: true,
      emails,
      nextPageToken: data['@odata.nextLink'] ? 'has-more' : null,
    });
  } catch (error) {
    console.error('Outlook sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync Outlook messages' },
      { status: 500 }
    );
  }
}

// Send email via Outlook
export async function PUT(request: NextRequest) {
  try {
    const { to, subject, body, accessToken, isHtml = false } = await request.json();

    if (!to || !subject || !body || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Send email using Microsoft Graph API
    const emailPayload = {
      message: {
        subject,
        body: {
          contentType: isHtml ? 'HTML' : 'Text',
          content: body,
        },
        toRecipients: Array.isArray(to) 
          ? to.map((email: string) => ({ emailAddress: { address: email } }))
          : [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    };

    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      throw new Error('Failed to send email via Outlook');
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Outlook email send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email via Outlook' },
      { status: 500 }
    );
  }
}

// Get calendar events
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Outlook access token not provided' },
        { status: 401 }
      );
    }

    // Get calendar events using Microsoft Graph API
    const filterParam = startDate && endDate 
      ? `&$filter=start/dateTime ge '${startDate}' and end/dateTime le '${endDate}'`
      : '';
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/events?$orderby=start/dateTime${filterParam}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();

    const events = data.value?.map((event: any) => ({
      id: event.id,
      subject: event.subject,
      start: event.start?.dateTime,
      end: event.end?.dateTime,
      location: event.location?.displayName || '',
      attendees: event.attendees?.map((a: any) => ({
        email: a.emailAddress?.address,
        name: a.emailAddress?.name,
        status: a.status?.response,
      })) || [],
      body: event.body?.content || '',
      isAllDay: event.isAllDay,
      showAs: event.showAs,
    })) || [];

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Outlook calendar fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
