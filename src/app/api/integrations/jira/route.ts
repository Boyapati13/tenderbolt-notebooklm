import { NextRequest, NextResponse } from 'next/server';

// Jira API integration
export async function POST(request: NextRequest) {
  try {
    const { credentials } = await request.json();
    
    // Test Jira connection
    const auth = Buffer.from(`${credentials.email}:${credentials.apiToken}`).toString('base64');
    
    const response = await fetch(`https://${credentials.domain}.atlassian.net/rest/api/3/myself`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Jira authentication failed');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Jira connected successfully',
      user: {
        accountId: data.accountId,
        displayName: data.displayName,
        emailAddress: data.emailAddress,
      },
    });
  } catch (error) {
    console.error('Jira connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Jira' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const apiToken = searchParams.get('apiToken');
    const email = searchParams.get('email');

    if (!domain || !apiToken || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing Jira credentials' },
        { status: 401 }
      );
    }

    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

    // Get projects
    const projectsResponse = await fetch(`https://${domain}.atlassian.net/rest/api/3/project`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (!projectsResponse.ok) {
      throw new Error('Failed to fetch Jira projects');
    }

    const projectsData = await projectsResponse.json();

    const projects = projectsData.map((project: any) => ({
      id: project.id,
      key: project.key,
      name: project.name,
      description: project.description || '',
      projectTypeKey: project.projectTypeKey,
      lead: project.lead?.displayName || '',
    }));

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Jira projects fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Jira projects' },
      { status: 500 }
    );
  }
}

// Create Jira issue
export async function PUT(request: NextRequest) {
  try {
    const { tenderId, issueData, credentials } = await request.json();

    if (!credentials || !issueData) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${credentials.email}:${credentials.apiToken}`).toString('base64');

    const issuePayload = {
      fields: {
        project: {
          key: issueData.projectKey || 'TENDER',
        },
        summary: issueData.summary || `Tender: ${tenderId}`,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: issueData.description || 'Tender management task created from Syntara Tenders AI',
                },
              ],
            },
          ],
        },
        issuetype: {
          name: issueData.issueType || 'Task',
        },
        priority: {
          name: issueData.priority || 'Medium',
        },
        labels: issueData.labels || ['tender', 'syntara'],
        customfield_10016: issueData.storyPoints || 3, // Story points field
      },
    };

    const response = await fetch(`https://${credentials.domain}.atlassian.net/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issuePayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errorMessages?.join(', ') || 'Failed to create Jira issue');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Jira issue created successfully',
      issueKey: data.key,
      issueId: data.id,
      issueUrl: `https://${credentials.domain}.atlassian.net/browse/${data.key}`,
    });
  } catch (error) {
    console.error('Jira issue creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Jira issue' },
      { status: 500 }
    );
  }
}
