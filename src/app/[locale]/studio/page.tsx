"use client";

import { useState } from "react";
import { StudioPanel } from "@/components/studio-panel";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

export default function StudioPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/en/workspace"
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Workspace
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Studio Tools</h1>
            <p className="text-gray-600 mt-2">AI-powered tools for content creation, analysis, and presentation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Studio Tools Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="min-h-[70vh]">
          <StudioPanel tenderId="global_documents" />
        </div>
      </div>
    </div>
  );
}
