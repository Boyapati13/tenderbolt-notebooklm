"use client";

import { useState } from "react";
import { DocumentComparisonPanel } from "@/components/document-comparison-panel";
import { ArrowLeft, Target } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function DocumentComparisonPage() {
  const searchParams = useSearchParams();
  const tenderId = searchParams.get('tenderId');
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link 
              href={tenderId ? `/en/workspace/${tenderId}` : "/en/dashboard"}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
            <ArrowLeft size={20} />
            Back to {tenderId ? 'Workspace' : 'Dashboard'}
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Comparison</h1>
            <p className="text-gray-600 mt-2">AI-powered analysis of your proposals against tender requirements</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Target size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Document Comparison Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="min-h-[70vh]">
          <DocumentComparisonPanel 
            tenderId={tenderId || "global_documents"} 
            tenderTitle={tenderId ? "Project Document Comparison" : "Global Document Comparison"} 
          />
        </div>
      </div>
    </div>
  );
}
