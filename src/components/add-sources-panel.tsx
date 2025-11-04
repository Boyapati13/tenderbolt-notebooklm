'use client';

import { ArrowLeft, Upload, Link, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AddSourcesPanel({ onBack, onChooseFile }: { onBack: () => void; onChooseFile: () => void; }) {
  return (
    <div className="h-full w-full bg-gray-900 p-8 text-white">
        <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Add New Sources</h1>
            <Button onClick={onBack} variant="outline">
                <ArrowLeft size={16} className="mr-2" />
                Back to Project
            </Button>
        </header>

      <p className="max-w-3xl text-gray-400 mb-10">
        Enrich your project by adding various sources. TenderBolt AI will use this information to provide more accurate and context-aware responses, helping you build a stronger tender proposal.
      </p>

      <Card className="border-2 border-dashed border-blue-500/50 bg-blue-900/20 mb-10">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Upload size={48} className="text-blue-400 mb-4" />
          <p className="text-lg font-semibold mb-2">Drag & drop files or <button onClick={onChooseFile} className="font-bold text-blue-400 hover:underline">browse your computer</button></p>
          <p className="text-sm text-gray-400">Supported formats: PDF, DOCX, TXT, Markdown</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SourceOption title="From the Web" icon={<Globe size={24} />} options={[
          { label: "Import from URL", action: () => {} },
          { label: "Connect to Google Drive", action: () => {} },
        ]} />
        <SourceOption title="Manual Input" icon={<FileText size={24} />} options={[
          { label: "Paste Text", action: () => {} },
          { label: "Write from Scratch", action: () => {} },
        ]} />
        <SourceOption title="Other" icon={<Link size={24} />} options={[
          { label: "Connect other apps (soon)", action: () => {}, disabled: true },
        ]} />
      </div>
    </div>
  );
}

function SourceOption({ title, icon, options }: { title: string, icon: React.ReactNode, options: { label: string, action: () => void, disabled?: boolean }[] }) {
    return (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex-row items-center gap-4">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
                {options.map((opt) => (
                    <Button key={opt.label} onClick={opt.action} variant="secondary" className="justify-start" disabled={opt.disabled}>
                        {opt.label}
                    </Button>
                ))}
            </div>
          </CardContent>
        </Card>
    )
}
