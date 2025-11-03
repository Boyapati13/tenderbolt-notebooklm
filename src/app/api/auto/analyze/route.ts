import { NextRequest, NextResponse } from 'next/server';
import { notebookLMAutoService } from '@/lib/notebooklm-auto-service';

export async function POST(request: NextRequest) {
  try {
    const { documentId, projectId, type } = await request.json();

    if (!documentId && !projectId) {
      return NextResponse.json(
        { error: 'Document ID or Project ID is required' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'document' && documentId) {
      console.log('🔍 Starting document auto analysis...');
      result = await notebookLMAutoService.analyzeDocument(documentId);
    } else if (type === 'project' && projectId) {
      console.log('💡 Starting project auto insights...');
      result = await notebookLMAutoService.generateProjectInsights(projectId);
    } else if (type === 'questions' && documentId) {
      console.log('❓ Generating auto questions...');
      result = await notebookLMAutoService.generateAutoQuestions(documentId);
    } else if (type === 'tags' && documentId) {
      console.log('🏷️ Auto-tagging document...');
      result = await notebookLMAutoService.autoTagDocument(documentId);
    } else if (type === 'validate' && documentId) {
      console.log('✅ Auto-validating document...');
      result = await notebookLMAutoService.validateDocument(documentId);
    } else {
      return NextResponse.json(
        { error: 'Invalid type or missing parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Auto analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform auto analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type');

    if (!documentId && !projectId) {
      return NextResponse.json(
        { error: 'Document ID or Project ID is required' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'document' && documentId) {
      result = await notebookLMAutoService.getDocumentAnalysis(documentId);
    } else if (type === 'project' && projectId) {
      result = await notebookLMAutoService.getProjectInsights(projectId);
    } else {
      return NextResponse.json(
        { error: 'Invalid type or missing parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error retrieving auto analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve auto analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
