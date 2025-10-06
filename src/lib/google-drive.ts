import { google } from 'googleapis';

// Initialize Google Drive client
let drive: any = null;

function initializeDrive() {
  if (!drive && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive',
        ],
      });

      drive = google.drive({ version: 'v3', auth });
      
      console.log('✅ Google Drive initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive:', error);
    }
  }
}

// Initialize on module load
initializeDrive();

/**
 * Upload a file to Google Drive
 * @param fileName - Name of the file
 * @param fileBuffer - File content as Buffer
 * @param mimeType - MIME type of the file
 * @param folderId - Optional parent folder ID
 * @returns File information including web links
 */
export async function uploadToDrive(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string = 'application/octet-stream',
  folderId?: string
): Promise<{
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  webContentLink?: string;
  error?: string;
}> {
  if (!drive) {
    return {
      success: false,
      error: 'Google Drive not configured',
    };
  }

  try {
    const fileMetadata: any = {
      name: fileName,
      mimeType: mimeType,
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: mimeType,
      body: require('stream').Readable.from(fileBuffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    console.log(`✅ File uploaded to Google Drive: ${fileName}`);

    return {
      success: true,
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    };
  } catch (error: any) {
    console.error('❌ Failed to upload to Google Drive:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create a folder in Google Drive
 * @param folderName - Name of the folder
 * @param parentFolderId - Optional parent folder ID
 * @returns Folder information
 */
export async function createDriveFolder(
  folderName: string,
  parentFolderId?: string
): Promise<{
  success: boolean;
  folderId?: string;
  webViewLink?: string;
  error?: string;
}> {
  if (!drive) {
    return {
      success: false,
      error: 'Google Drive not configured',
    };
  }

  try {
    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, webViewLink',
    });

    console.log(`✅ Folder created in Google Drive: ${folderName}`);

    return {
      success: true,
      folderId: response.data.id,
      webViewLink: response.data.webViewLink,
    };
  } catch (error: any) {
    console.error('❌ Failed to create folder:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Share a file or folder with specific email addresses
 * @param fileId - ID of the file or folder
 * @param emails - Array of email addresses
 * @param role - Permission role (reader, writer, commenter)
 * @returns Success status
 */
export async function shareWithEmails(
  fileId: string,
  emails: string[],
  role: 'reader' | 'writer' | 'commenter' = 'reader'
): Promise<boolean> {
  if (!drive) {
    return false;
  }

  try {
    for (const email of emails) {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          type: 'user',
          role: role,
          emailAddress: email,
        },
      });
    }

    console.log(`✅ File shared with ${emails.length} users`);
    return true;
  } catch (error) {
    console.error('Failed to share file:', error);
    return false;
  }
}

/**
 * Make a file publicly accessible
 * @param fileId - ID of the file
 * @returns Success status
 */
export async function makePublic(fileId: string): Promise<boolean> {
  if (!drive) {
    return false;
  }

  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        type: 'anyone',
        role: 'reader',
      },
    });

    console.log(`✅ File made public: ${fileId}`);
    return true;
  } catch (error) {
    console.error('Failed to make file public:', error);
    return false;
  }
}

/**
 * Delete a file from Google Drive
 * @param fileId - ID of the file
 * @returns Success status
 */
export async function deleteFromDrive(fileId: string): Promise<boolean> {
  if (!drive) {
    return false;
  }

  try {
    await drive.files.delete({
      fileId: fileId,
    });

    console.log(`✅ File deleted from Google Drive: ${fileId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
}

