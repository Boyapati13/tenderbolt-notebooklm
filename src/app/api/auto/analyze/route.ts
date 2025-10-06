import { NextRequest, NextResponse } from 'next/server';
import { notebookLMAutoService } from '@/lib/notebooklm-auto-service';

export async function POST(request: NextRequest) {
  try {
    const { documentId, tenderId, type } = await request.json();

    if (!documentId && !tenderId) {
      return NextResponse.json(
        { error: 'Document ID or Tender ID is required' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'document' && documentId) {
      console.log('🔍 Starting document auto analysis...');
      result = await notebookLMAutoService.analyzeDocument(documentId);
    } else if (type === 'tender' && tenderId) {
      console.log('💡 Starting tender auto insights...');
      result = await notebookLMAutoService.generateTenderInsights(tenderId);
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
    const tenderId = searchParams.get('tenderId');
    const type = searchParams.get('type');

    if (!documentId && !tenderId) {
      return NextResponse.json(
        { error: 'Document ID or Tender ID is required' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'document' && documentId) {
      result = await notebookLMAutoService.getDocumentAnalysis(documentId);
    } else if (type === 'tender' && tenderId) {
      result = await notebookLMAutoService.getTenderInsights(tenderId);
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
