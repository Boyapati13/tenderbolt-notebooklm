'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  FileText, 
  Tag, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Eye,
  Download,
  Share2,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Lightbulb,
  HelpCircle,
  Search,
  Filter,
  Star
} from 'lucide-react';

interface AutoAnalysisResult {
  metadata: {
    title: string;
    summary: string;
    keyTopics: string[];
    documentType: string;
    complexity: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadingTime: number;
    language: string;
    confidence: number;
  };
  insights: {
    mainPoints: string[];
    keyFindings: string[];
    implications: string[];
    recommendations: string[];
    questions: string[];
  };
  citations: {
    sources: Array<{
      id: string;
      title: string;
      type: string;
      relevance: number;
      excerpt: string;
    }>;
    crossReferences: Array<{
      sourceId: string;
      targetId: string;
      relationship: string;
    }>;
  };
  tags: {
    categories: string[];
    keywords: string[];
    themes: string[];
    industries: string[];
  };
  quality: {
    completeness: number;
    accuracy: number;
    clarity: number;
    structure: number;
    overall: number;
  };
  recommendations: {
    relatedDocuments: string[];
    suggestedActions: string[];
    improvementAreas: string[];
    nextSteps: string[];
  };
}

interface NotebookLMAutoPanelProps {
  tenderId: string;
  documentId?: string;
  onClose?: () => void;
}

export default function NotebookLMAutoPanel({ tenderId, documentId, onClose }: NotebookLMAutoPanelProps) {
  const [activeTab, setActiveTab] = useState<'document' | 'tender' | 'questions' | 'tags' | 'validate'>('document');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AutoAnalysisResult | null>(null);
  const [tenderInsights, setTenderInsights] = useState<any>(null);
  const [autoQuestions, setAutoQuestions] = useState<string[]>([]);
  const [autoTags, setAutoTags] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runAutoAnalysis = async (type: 'document' | 'tender' | 'questions' | 'tags' | 'validate') => {
    if (!documentId && type !== 'tender') {
      setError('Document ID is required for this analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/auto/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          tenderId,
          type
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      switch (type) {
        case 'document':
          setAnalysisResult(data.result);
          break;
        case 'tender':
          setTenderInsights(data.result);
          break;
        case 'questions':
          setAutoQuestions(data.result);
          break;
        case 'tags':
          setAutoTags(data.result);
          break;
        case 'validate':
          setValidation(data.result);
          break;
      }

    } catch (error) {
      console.error('Auto analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityGrade = (score: number) => {
    if (score >= 0.9) return 'A+';
    if (score >= 0.8) return 'A';
    if (score >= 0.7) return 'B+';
    if (score >= 0.6) return 'B';
    if (score >= 0.5) return 'C';
    return 'D';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">NotebookLM Auto Analysis</h2>
            <p className="text-sm text-gray-600">AI-powered document and tender insights</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'document', label: 'Document Analysis', icon: FileText },
          { id: 'tender', label: 'Tender Insights', icon: Target },
          { id: 'questions', label: 'Auto Questions', icon: HelpCircle },
          { id: 'tags', label: 'Auto Tags', icon: Tag },
          { id: 'validate', label: 'Validation', icon: CheckCircle }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Analysis Button */}
      <div className="mb-6">
        <button
          onClick={() => runAutoAnalysis(activeTab)}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isAnalyzing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Zap size={20} />
          )}
          {isAnalyzing ? 'Analyzing...' : `Run ${activeTab === 'document' ? 'Document' : activeTab === 'tender' ? 'Tender' : activeTab === 'questions' ? 'Questions' : activeTab === 'tags' ? 'Tags' : 'Validation'} Analysis`}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800 font-medium">Analysis Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        {/* Document Analysis */}
        {activeTab === 'document' && analysisResult && (
          <div className="space-y-6">
            {/* Metadata */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Document Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Title</label>
                  <p className="text-gray-900">{analysisResult.metadata.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-gray-900 capitalize">{analysisResult.metadata.documentType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Complexity</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(analysisResult.metadata.complexity)}`}>
                    {analysisResult.metadata.complexity}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Reading Time</label>
                  <p className="text-gray-900">{analysisResult.metadata.estimatedReadingTime} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Confidence</label>
                  <p className="text-gray-900">{(analysisResult.metadata.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Language</label>
                  <p className="text-gray-900 uppercase">{analysisResult.metadata.language}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Summary</label>
                <p className="text-gray-900 mt-1">{analysisResult.metadata.summary}</p>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Key Topics</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysisResult.metadata.keyTopics.map((topic, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb size={20} />
                Key Insights
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Main Points</h4>
                  <ul className="space-y-1">
                    {analysisResult.insights.mainPoints.map((point, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Findings</h4>
                  <ul className="space-y-1">
                    {analysisResult.insights.keyFindings.map((finding, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {analysisResult.insights.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quality Assessment */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Quality Assessment
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(analysisResult.quality).map(([key, score]) => (
                  <div key={key} className="text-center">
                    <div className={`text-2xl font-bold ${getQualityColor(score)}`}>
                      {getQualityGrade(score)}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                    <div className="text-xs text-gray-500">{(score * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag size={20} />
                Auto-Generated Tags
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.tags.categories.map((category, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.tags.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.tags.themes.map((theme, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tender Insights */}
        {activeTab === 'tender' && tenderInsights && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target size={20} />
                Tender Insights
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Executive Summary</h4>
                  <p className="text-gray-700">{tenderInsights.executiveSummary}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Success Probability</h4>
                    <div className="text-3xl font-bold text-green-600">
                      {(tenderInsights.successProbability * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Priority Level</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tenderInsights.priorityLevel === 'high' ? 'bg-red-100 text-red-800' :
                      tenderInsights.priorityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {tenderInsights.priorityLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Key Strengths</h4>
                <ul className="space-y-2">
                  {tenderInsights.keyStrengths?.map((strength: string, index: number) => (
                    <li key={index} className="text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Potential Challenges</h4>
                <ul className="space-y-2">
                  {tenderInsights.potentialChallenges?.map((challenge: string, index: number) => (
                    <li key={index} className="text-gray-700 flex items-start gap-2">
                      <span className="text-red-600 mt-1">⚠</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Recommended Actions</h4>
              <ul className="space-y-2">
                {tenderInsights.recommendedActions?.map((action: string, index: number) => (
                  <li key={index} className="text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 mt-1">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Auto Questions */}
        {activeTab === 'questions' && autoQuestions.length > 0 && (
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle size={20} />
              Auto-Generated Questions
            </h3>
            <div className="space-y-3">
              {autoQuestions.map((question, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-900">{question}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto Tags */}
        {activeTab === 'tags' && autoTags && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag size={20} />
              Auto-Generated Tags
            </h3>
            <div className="space-y-4">
              {Object.entries(autoTags).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">{key}</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(value) ? value.map((item: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
                        {item}
                      </span>
                    )) : (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
                        {value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation */}
        {activeTab === 'validate' && validation && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              Document Validation
            </h3>
            <div className="space-y-4">
              {Object.entries(validation).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">{key}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getQualityColor(value.score || 0)}`}>
                        {getQualityGrade(value.score || 0)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {((value.score || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  {value.issues && value.issues.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-red-600 font-medium mb-1">Issues:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {value.issues.map((issue: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {value.suggestions && value.suggestions.length > 0 && (
                    <div>
                      <p className="text-sm text-blue-600 font-medium mb-1">Suggestions:</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {value.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!analysisResult && !tenderInsights && autoQuestions.length === 0 && !autoTags && !validation && (
          <div className="text-center py-12">
            <Brain className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
            <p className="text-gray-600 mb-4">
              Click the analysis button above to get started with NotebookLM-style auto analysis
            </p>
            <div className="flex justify-center gap-2">
              <Sparkles className="text-purple-500" size={20} />
              <span className="text-purple-600 font-medium">AI-Powered Insights</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
