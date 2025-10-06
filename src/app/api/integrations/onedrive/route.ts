import { NextRequest, NextResponse } from 'next/server';

// OneDrive API integration using Microsoft Graph
export async function POST(request: NextRequest) {
  try {
    const { credentials } = await request.json();
    
    // Test OneDrive connection using Microsoft Graph API
    const response = await fetch('https://graph.microsoft.com/v1.0/me/drive', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('OneDrive authentication failed');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'OneDrive connected successfully',
      driveId: data.id,
      driveType: data.driveType,
      owner: data.owner?.user?.displayName,
    });
  } catch (error) {
    console.error('OneDrive connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to OneDrive' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || 'root';
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const accessToken = searchParams.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'OneDrive access token not provided' },
        { status: 401 }
      );
    }

    // List files from specified folder using Microsoft Graph API
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children?$top=${pageSize}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch OneDrive files');
    }

    const data = await response.json();

    const files = data.value?.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.file?.mimeType || 'application/vnd.microsoft.folder',
      size: file.size || 0,
      modifiedTime: file.lastModifiedDateTime,
      webUrl: file.webUrl,
      downloadUrl: file['@microsoft.graph.downloadUrl'],
      isFolder: file.folder !== undefined,
      createdBy: file.createdBy?.user?.displayName,
      lastModifiedBy: file.lastModifiedBy?.user?.displayName,
    })) || [];

    return NextResponse.json({
      success: true,
      files,
      nextPageToken: data['@odata.nextLink'] ? 'has-more' : null,
    });
  } catch (error) {
    console.error('OneDrive sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync OneDrive files' },
      { status: 500 }
    );
  }
}

// Upload file to OneDrive
export async function PUT(request: NextRequest) {
  try {
    const { fileName, fileContent, folderId, accessToken } = await request.json();

    if (!fileName || !fileContent || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Upload file to OneDrive using Microsoft Graph API
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${folderId || 'root'}:/${fileName}:/content`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: fileContent,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to OneDrive');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: data.id,
      webUrl: data.webUrl,
      downloadUrl: data['@microsoft.graph.downloadUrl'],
    });
  } catch (error) {
    console.error('OneDrive upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file to OneDrive' },
      { status: 500 }
    );
  }
}
