const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying TenderBolt as Static Site to Firebase...');

// Step 1: Create a static-compatible Next.js config
console.log('⚙️ Creating static-compatible Next.js config...');

const staticNextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://your-project-id.web.app' 
      : 'http://localhost:3002'
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable API routes for static export
  async rewrites() {
    return [];
  },
  // Generate static pages
  async generateStaticParams() {
    return [
      { locale: 'en' },
    ];
  }
}

module.exports = nextConfig
`;

fs.writeFileSync('.next.config.static.js', staticNextConfig);
console.log('✅ Static Next.js config created');

// Step 2: Create a static-compatible version of the app
console.log('📝 Creating static-compatible app structure...');

// Create a static version of the studio page
const staticStudioPage = `
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Play, Pause, Volume2, Settings, Download, 
  Share2, Heart, Clock, Users, Zap, Sparkles, MessageCircle, 
  Bot, User, Send, Mic, MicOff, RotateCcw, SkipForward, 
  SkipBack, Maximize2, Minimize2, VolumeX } from "lucide-react";

export default function StudioPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [interactiveMode, setInteractiveMode] = useState(false);

  const studioTools = [
    {
      id: "audio-overview",
      name: "Audio Overview",
      description: "Generate professional audio content with AI-powered text-to-speech",
      icon: Volume2,
      category: "Content Generation",
      features: ["Text-to-Speech", "Multiple Voices", "Interactive Mode", "Export Options"],
      color: "bg-blue-500"
    },
    {
      id: "video-overview", 
      name: "Video Overview",
      description: "Create engaging video presentations and scripts",
      icon: Play,
      category: "Content Generation",
      features: ["Video Scripts", "Presentation Styles", "Auto-Advance", "Fullscreen Mode"],
      color: "bg-purple-500"
    },
    {
      id: "mind-map",
      name: "Mind Map",
      description: "Visualize ideas and concepts with interactive mind maps",
      icon: Zap,
      category: "Visualization",
      features: ["Interactive Canvas", "Drag & Drop", "Export Options", "Real-time Updates"],
      color: "bg-green-500"
    },
    {
      id: "reports",
      name: "Reports",
      description: "Generate comprehensive analysis and reports",
      icon: Settings,
      category: "Analysis",
      features: ["Multiple Formats", "Advanced Filtering", "Export Options", "Key Insights"],
      color: "bg-orange-500"
    },
    {
      id: "flashcards",
      name: "Flashcards",
      description: "Create and study with interactive flashcards",
      icon: Heart,
      category: "Learning",
      features: ["Interactive Study", "Progress Tracking", "Multiple Formats", "Spaced Repetition"],
      color: "bg-pink-500"
    },
    {
      id: "quiz",
      name: "Quiz",
      description: "Build and take interactive quizzes and assessments",
      icon: Users,
      category: "Assessment",
      features: ["Multiple Question Types", "Timer", "Results", "Progress Tracking"],
      color: "bg-indigo-500"
    }
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleBackToTools = () => {
    setSelectedTool(null);
  };

  if (selectedTool) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToTools}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Studio</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {studioTools.find(tool => tool.id === selectedTool)?.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInteractiveMode(!interactiveMode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  interactiveMode 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <MessageCircle size={16} className="inline mr-1" />
                Interactive Mode
              </button>
            </div>
          </div>
        </div>

        {/* Tool Content */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  {selectedTool === "audio-overview" && <Volume2 size={32} className="text-gray-400" />}
                  {selectedTool === "video-overview" && <Play size={32} className="text-gray-400" />}
                  {selectedTool === "mind-map" && <Zap size={32} className="text-gray-400" />}
                  {selectedTool === "reports" && <Settings size={32} className="text-gray-400" />}
                  {selectedTool === "flashcards" && <Heart size={32} className="text-gray-400" />}
                  {selectedTool === "quiz" && <Users size={32} className="text-gray-400" />}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {studioTools.find(tool => tool.id === selectedTool)?.name}
                </h2>
                <p className="text-gray-600 mb-6">
                  {studioTools.find(tool => tool.id === selectedTool)?.description}
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Sparkles size={20} />
                    <span className="font-medium">Static Demo Mode</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    This is a static preview. Full functionality requires server-side features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Workspace</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">Studio</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Studio Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create, analyze, and visualize content with our comprehensive suite of AI-powered tools.
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studioTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {tool.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {tool.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {tool.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Sparkles size={24} className="text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Static Demo Mode
                </h3>
                <p className="text-blue-800 mb-3">
                  This is a static preview of the Studio tools. For full functionality including:
                </p>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• AI-powered content generation</li>
                  <li>• Real-time audio and video processing</li>
                  <li>• Interactive mind maps and visualizations</li>
                  <li>• Database integration and user authentication</li>
                </ul>
                <p className="text-blue-800 text-sm mt-3">
                  Deploy to Vercel or use Firebase Functions for complete functionality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

// Create static pages directory
const staticPagesDir = path.join(process.cwd(), 'src', 'app', '[locale]', 'studio-static');
if (!fs.existsSync(staticPagesDir)) {
  fs.mkdirSync(staticPagesDir, { recursive: true });
}

fs.writeFileSync(path.join(staticPagesDir, 'page.tsx'), staticStudioPage);
console.log('✅ Static studio page created');

// Step 3: Update firebase.json for static hosting
console.log('📝 Updating firebase.json for static hosting...');

const staticFirebaseConfig = {
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/en/studio",
        "destination": "/en/studio-static/index.html"
      },
      {
        "source": "/en/studio/**",
        "destination": "/en/studio-static/index.html"
      },
      {
        "source": "/en/dashboard",
        "destination": "/en/dashboard/index.html"
      },
      {
        "source": "/en/dashboard/**",
        "destination": "/en/dashboard/index.html"
      },
      {
        "source": "/en/workspace/**",
        "destination": "/en/workspace/index.html"
      },
      {
        "source": "/en/document-comparison",
        "destination": "/en/document-comparison/index.html"
      },
      {
        "source": "/en/document-comparison/**",
        "destination": "/en/document-comparison/index.html"
      },
      {
        "source": "/en",
        "destination": "/en/index.html"
      },
      {
        "source": "/",
        "destination": "/en/index.html"
      },
      {
        "source": "**",
        "destination": "/404.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=0"
          }
        ]
      }
    ]
  }
};

fs.writeFileSync('firebase.json', JSON.stringify(staticFirebaseConfig, null, 2));
console.log('✅ firebase.json updated for static hosting');

// Step 4: Build the static application
console.log('🔨 Building static Next.js application...');
try {
  // Copy static config
  fs.copyFileSync('.next.config.static.js', 'next.config.js');
  
  // Build the app
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Static Next.js application built successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('🎉 Static Firebase deployment setup completed!');
console.log('');
console.log('Next steps:');
console.log('1. Update your Firebase project ID in .next.config.static.js');
console.log('2. Run: firebase deploy');
console.log('3. Your static app will be available at: https://your-project-id.web.app');
console.log('');
console.log('Note: This creates a static version with limited functionality.');
console.log('For full functionality, use Vercel or Firebase Functions.');
