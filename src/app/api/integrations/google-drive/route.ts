import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Google Drive API integration
export async function POST(request: NextRequest) {
  try {
    const { credentials } = await request.json();
    
    // Initialize Google Drive API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Test connection by listing files
    const response = await drive.files.list({
      pageSize: 1,
      fields: 'nextPageToken, files(id, name)',
    });

    return NextResponse.json({
      success: true,
      message: 'Google Drive connected successfully',
      filesCount: response.data.files?.length || 0,
    });
  } catch (error) {
    console.error('Google Drive connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Google Drive' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || 'root';
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    // Get credentials from request headers or session
    const credentials = {
      accessToken: request.headers.get('x-google-access-token'),
      refreshToken: request.headers.get('x-google-refresh-token'),
    };

    if (!credentials.accessToken || !credentials.refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Google Drive credentials not found' },
        { status: 401 }
      );
    }

    // Initialize Google Drive API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // List files from specified folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      pageSize,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink)',
      orderBy: 'modifiedTime desc',
    });

    const files = response.data.files?.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size) : 0,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
    })) || [];

    return NextResponse.json({
      success: true,
      files,
      nextPageToken: response.data.nextPageToken,
    });
  } catch (error) {
    console.error('Google Drive sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync Google Drive files' },
      { status: 500 }
    );
  }
}
