"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Volume2, Play, Pause, Download, RefreshCw, Mic, VolumeX, Volume1, 
  SkipBack, SkipForward, RotateCcw, Settings, Share2, Save, Edit3,
  Clock, Users, Zap, Sparkles, Target, BarChart3, Eye, Maximize2,
  MicIcon, MicOff, MessageCircle, Headphones, Radio, Phone, Video
} from "lucide-react";

interface AudioOverviewProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

type NarrationStyle = "brief" | "deep-dive" | "podcast" | "presentation" | "interview" | "conversational" | "interactive";

interface AudioScript {
  style: NarrationStyle;
  title: string;
  duration: string;
  script: string;
  sections: Array<{
    speaker?: string;
    timestamp: string;
    text: string;
    duration: number;
  }>;
  metadata?: {
    wordCount: number;
    speakingRate: number;
    complexity: "beginner" | "intermediate" | "advanced";
    tone: "professional" | "casual" | "authoritative" | "conversational";
  };
}

export function AudioOverview({ tenderId, interactiveMode = "preview" }: AudioOverviewProps) {
  const [selectedStyle, setSelectedStyle] = useState<NarrationStyle>("interactive");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioScript, setAudioScript] = useState<AudioScript | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Speech-to-Speech Interaction States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', text: string, timestamp: Date}>>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'default',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  });
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

  const styles: Array<{ 
    value: NarrationStyle; 
    label: string; 
    description: string; 
    duration: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      value: "interactive",
      label: "Interactive Voice",
      description: "Speech-to-speech conversation with AI",
      duration: "Unlimited",
      icon: <MessageCircle size={16} />,
      color: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      value: "conversational",
      label: "Conversational",
      description: "Natural dialogue style",
      duration: "~5-8 min",
      icon: <Phone size={16} />,
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      value: "brief",
      label: "Brief Overview",
      description: "Quick 2-3 minute summary of key points",
      duration: "~2-3 min",
      icon: <Zap size={16} />,
      color: "text-green-600 bg-green-50 border-green-200"
    },
    {
      value: "deep-dive",
      label: "Deep Dive",
      description: "Comprehensive 10-15 minute analysis",
      duration: "~10-15 min",
      icon: <Target size={16} />,
      color: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      value: "podcast",
      label: "Podcast Style",
      description: "Conversational discussion format",
      duration: "~5-8 min",
      icon: <Users size={16} />,
      color: "text-green-600 bg-green-50 border-green-200"
    },
    {
      value: "presentation",
      label: "Presentation",
      description: "Formal presentation with clear structure",
      duration: "~8-12 min",
      icon: <BarChart3 size={16} />,
      color: "text-orange-600 bg-orange-50 border-orange-200"
    },
    {
      value: "interview",
      label: "Interview Style",
      description: "Q&A format with multiple speakers",
      duration: "~6-10 min",
      icon: <Mic size={16} />,
      color: "text-red-600 bg-red-50 border-red-200"
    }
  ];

  // Initialize Speech Recognition and Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Use continuous mode to prevent "no-speech" errors
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          showNotification("🎤 Listening... Speak clearly now!", "info");
        };
        
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Only process final results
          if (finalTranscript.trim()) {
            console.log('Speech recognized:', finalTranscript);
            setCurrentQuestion(finalTranscript);
            handleSpeechInput(finalTranscript);
          }
        };
        
        recognition.onerror = (event) => {
          // Handle "no-speech" errors as normal behavior in continuous mode
          if (event.error === 'no-speech') {
            console.log('No speech detected, but continuing to listen...');
            showNotification("💡 No speech detected. Keep speaking - I'm still listening!", "info");
            return; // Don't stop listening, don't log as error, don't process further
          }
          
          // Only log serious errors to console
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          let errorMessage = "Speech recognition error";
          
          switch (event.error) {
            case 'not-allowed':
              errorMessage = "Microphone access denied. Please allow microphone access and try again.";
              break;
            case 'network':
              errorMessage = "Network error. Please check your connection.";
              break;
            case 'aborted':
              errorMessage = "Speech recognition was stopped.";
              break;
            case 'audio-capture':
              errorMessage = "No microphone found. Please check your microphone.";
              break;
            case 'service-not-allowed':
              errorMessage = "Speech recognition service not allowed. Please use HTTPS.";
              break;
            default:
              errorMessage = `Speech recognition error: ${event.error}`;
          }
          
          showNotification(errorMessage, "error");
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          
          // Auto-restart listening if it ended unexpectedly (not manually stopped)
          // This helps maintain continuous listening
          setTimeout(() => {
            if (!isListening && speechRecognition && !isSpeaking && !isProcessingSpeech) {
              console.log('Auto-restarting speech recognition...');
              try {
                speechRecognition.start();
              } catch (error) {
                console.log('Could not auto-restart speech recognition:', error);
              }
            }
          }, 1000);
        };
        
        setSpeechRecognition(recognition);
      } else {
        console.warn('Speech recognition not supported in this browser');
        showNotification('Speech recognition not supported in this browser. Please use Chrome or Edge.', "warning");
      }
      
      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        setSpeechSynthesis(window.speechSynthesis);
      } else {
        console.warn('Speech synthesis not supported in this browser');
        showNotification('Speech synthesis not supported in this browser', "warning");
      }
    }
  }, []);

  const handleTextInput = async () => {
    if (!textInput.trim()) return;
    
    setIsProcessingSpeech(true);
    
    // Add user message to conversation history
    const userMessage = { role: 'user' as const, text: textInput, timestamp: new Date() };
    setConversationHistory(prev => [...prev, userMessage]);
    
    try {
      // Send to AI for processing with tender context
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are an AI assistant helping with tender management. The user is asking questions about tender ID: ${tenderId || 'default'}. Provide helpful, accurate responses based on the tender information. Keep responses conversational and under 200 words.`
            },
            { role: "user", content: textInput }
          ],
          tenderId: tenderId || "default"
        })
      });
      
      const data = await response.json();
      const aiResponse = data.reply || "I didn't understand that. Could you please repeat?";
      
      // Add AI response to conversation history
      const aiMessage = { role: 'assistant' as const, text: aiResponse, timestamp: new Date() };
      setConversationHistory(prev => [...prev, aiMessage]);
      
      // Speak the response
      speakText(aiResponse);
      
      // Clear text input
      setTextInput("");
      setShowTextInput(false);
      
    } catch (error) {
      console.error("Error processing text input:", error);
      const errorMessage = "Sorry, I encountered an error processing your request.";
      const errorMsg = { role: 'assistant' as const, text: errorMessage, timestamp: new Date() };
      setConversationHistory(prev => [...prev, errorMsg]);
      speakText(errorMessage);
    } finally {
      setIsProcessingSpeech(false);
    }
  };

  const speakText = (text: string) => {
    if (speechSynthesis) {
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        // Handle "interrupted" errors as normal behavior when speech is stopped
        if (event.error === 'interrupted') {
          console.log('Speech synthesis interrupted - this is normal when stopping speech');
          setIsSpeaking(false);
          return; // Don't log as error, don't show notification
        }
        
        // Only log serious speech synthesis errors
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        
        // Show user-friendly error messages for serious errors
        let errorMessage = "Speech synthesis error";
        switch (event.error) {
          case 'not-allowed':
            errorMessage = "Speech synthesis not allowed. Please check browser permissions.";
            break;
          case 'network':
            errorMessage = "Network error during speech synthesis.";
            break;
          case 'synthesis-failed':
            errorMessage = "Speech synthesis failed. Please try again.";
            break;
          case 'synthesis-unavailable':
            errorMessage = "Speech synthesis not available in this browser.";
            break;
          case 'language-unavailable':
            errorMessage = "Selected language not available for speech synthesis.";
            break;
          case 'voice-unavailable':
            errorMessage = "Selected voice not available.";
            break;
          case 'text-too-long':
            errorMessage = "Text too long for speech synthesis.";
            break;
          case 'invalid-argument':
            errorMessage = "Invalid argument for speech synthesis.";
            break;
          default:
            errorMessage = `Speech synthesis error: ${event.error}`;
        }
        
        showNotification(errorMessage, "error");
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      // Cancel speech synthesis - this will trigger "interrupted" error which is normal
      speechSynthesis.cancel();
      setIsSpeaking(false);
      showNotification("Audio stopped", "info");
    }
  };

  const startListening = async () => {
    if (!speechRecognition) {
      showNotification("Speech recognition not available. Please use Chrome or Edge browser.", "error");
      return;
    }

    if (isListening) {
      showNotification("Already listening...", "info");
      return;
    }

    if (isSpeaking) {
      showNotification("AI is speaking. Please wait...", "info");
      return;
    }

    if (isProcessingSpeech) {
      showNotification("Processing previous request. Please wait...", "info");
      return;
    }

    try {
      // Request microphone permission first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('Microphone permission granted');
        } catch (permissionError) {
          console.error('Microphone permission denied:', permissionError);
          showNotification("Microphone access denied. Please allow microphone access in your browser settings and refresh the page.", "error");
          return;
        }
      }

      // Start speech recognition
      speechRecognition.start();
      console.log('Starting speech recognition...');
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      showNotification("Failed to start listening. Please try again.", "error");
    }
  };

  const stopListening = () => {
    if (speechRecognition && isListening) {
      try {
        speechRecognition.stop();
        showNotification("Stopped listening", "info");
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };

  const handleGenerate = async () => {
    if (selectedStyle === "interactive") {
      // For interactive mode, start with a greeting
      const greeting = "Hello! I'm your AI assistant for this tender. I can help you understand the project requirements, deadlines, budget, and any other details. You can ask me questions like 'What is the deadline?' or 'What are the main requirements?' What would you like to know?";
      const greetingMsg = { role: 'assistant' as const, text: greeting, timestamp: new Date() };
      setConversationHistory([greetingMsg]);
      speakText(greeting);
      showNotification("Interactive mode started! Click 'Start Speaking' to begin conversation.", "success");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: tenderId || "tender_default",
          style: selectedStyle,
          interactiveMode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAudioScript(data.audioScript);
        setEditedScript(data.audioScript.script);
        showNotification("Audio script generated successfully!", "success");
      } else {
        showNotification("Failed to generate audio script: " + (data.error || "Unknown error"), "error");
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      showNotification("Failed to generate audio script. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioScript) return;
    
    const content = `${audioScript.title}\n${"=".repeat(audioScript.title.length)}\n\nStyle: ${audioScript.style}\nDuration: ${audioScript.duration}\nWord Count: ${audioScript.metadata?.wordCount || 0}\nSpeaking Rate: ${audioScript.metadata?.speakingRate || 150} WPM\nComplexity: ${audioScript.metadata?.complexity || 'intermediate'}\nTone: ${audioScript.metadata?.tone || 'professional'}\n\n${audioScript.script}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audio-script-${audioScript.style}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("Audio script downloaded!", "success");
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control actual audio playback
  };

  const nextSection = () => {
    if (audioScript && currentSection < audioScript.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const saveEdits = () => {
    if (!audioScript) return;
    
    const updatedScript = {
      ...audioScript,
      script: editedScript
    };
    setAudioScript(updatedScript);
    setIsEditing(false);
    showNotification("Script updated successfully!", "success");
  };

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === "success" ? "bg-green-500 text-white" :
      type === "error" ? "bg-red-500 text-white" :
      "bg-blue-500 text-white"
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const getModeIcon = () => {
    switch (interactiveMode) {
      case "preview": return <Eye size={16} />;
      case "edit": return <Edit3 size={16} />;
      case "present": return <Maximize2 size={16} />;
      case "collaborate": return <Users size={16} />;
      default: return <Eye size={16} />;
    }
  };

  const getModeColor = () => {
    switch (interactiveMode) {
      case "preview": return "text-blue-600 bg-blue-50 border-blue-200";
      case "edit": return "text-green-600 bg-green-50 border-green-200";
      case "present": return "text-purple-600 bg-purple-50 border-purple-200";
      case "collaborate": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Volume2 className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-heading text-foreground">Audio Overview</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getModeColor()}`}>
              {getModeIcon()}
              {interactiveMode.charAt(0).toUpperCase() + interactiveMode.slice(1)} Mode
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Advanced Options"
          >
            <Settings size={16} />
          </button>
          {audioScript && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-muted-foreground hover:text-green-600 transition-colors"
                title="Edit Script"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                title="Download Script"
              >
                <Download size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-heading text-foreground">Advanced Audio Options</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Save size={16} className="text-gray-600" />
              <span className="text-sm">Save Template</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Share2 size={16} className="text-gray-600" />
              <span className="text-sm">Share Script</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <RotateCcw size={16} className="text-gray-600" />
              <span className="text-sm">Reset to Original</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <BarChart3 size={16} className="text-gray-600" />
              <span className="text-sm">Analytics</span>
            </button>
          </div>
        </div>
      )}

      {/* Style Selection */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-heading text-foreground">Choose Audio Style</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {styles.map((style) => (
          <button
            key={style.value}
            onClick={() => setSelectedStyle(style.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
              selectedStyle === style.value
                  ? `${style.color} border-current`
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedStyle === style.value ? "bg-current text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {style.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm">{style.label}</div>
                  <div className="text-xs text-gray-500">{style.duration}</div>
                </div>
              </div>
              <div className="text-xs text-gray-600">{style.description}</div>
          </button>
        ))}
        </div>
      </div>

      {/* Interactive Conversation Interface */}
      {selectedStyle === "interactive" && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageCircle size={20} className="text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-heading text-foreground">Interactive Voice Assistant</h4>
              <p className="text-sm text-gray-600">Speak naturally to ask questions about this tender</p>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">📋 How to use Interactive Mode:</h5>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Click "Check Mic" to ensure microphone access is granted</li>
              <li>2. Click "Start Speaking" to begin listening</li>
              <li>3. <strong>Wait for the microphone icon to appear</strong> before speaking</li>
              <li>4. Ask questions like "What is the deadline?" or "What are the requirements?"</li>
              <li>5. Speak clearly and at normal volume</li>
              <li>6. Wait for AI to respond and speak the answer</li>
              <li>7. Continue the conversation naturally</li>
            </ol>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-xs text-yellow-800">
                ⚠️ <strong>Important:</strong> If you get "No speech detected" error, make sure to:
                <ul className="mt-1 ml-4 list-disc">
                  <li>Wait for the microphone icon to appear before speaking</li>
                  <li>Speak clearly and at normal volume</li>
                  <li>Ensure your microphone is working and not muted</li>
                  <li>Try speaking immediately after clicking "Start Speaking"</li>
                </ul>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-700">
              💡 <strong>Tip:</strong> Use Chrome or Edge browser for best speech recognition support
            </div>
          </div>
          
          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking || isProcessingSpeech}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isListening 
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" 
                  : "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105"
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
            >
              {isListening ? (
                <>
                  <div className="relative">
                    <MicOff size={20} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"></div>
                  </div>
                  Stop Listening
                </>
              ) : (
                <>
                  <MicIcon size={20} />
                  Start Speaking
                </>
              )}
            </button>
            
            {/* Microphone Permission Check */}
            <button
              onClick={async () => {
                try {
                  await navigator.mediaDevices.getUserMedia({ audio: true });
                  showNotification("✅ Microphone access granted!", "success");
                } catch (error) {
                  showNotification("❌ Microphone access denied. Please allow microphone access in your browser.", "error");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              title="Check microphone permission"
            >
              <Mic size={16} />
              Check Mic
            </button>
            
            {/* Text Input Toggle */}
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              title="Toggle text input option"
            >
              <Edit3 size={16} />
              {showTextInput ? "Hide Text" : "Type Instead"}
            </button>
            
            {/* Stop Audio Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                title="Stop AI speaking"
              >
                <VolumeX size={16} />
                Stop Audio
              </button>
            )}
            
            {isSpeaking && (
              <div className="flex items-center gap-2 text-purple-600">
                <div className="animate-pulse">
                  <Volume2 size={20} />
                </div>
                <span className="text-sm font-medium">AI is speaking...</span>
              </div>
            )}
            
            {isProcessingSpeech && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Processing...</span>
              </div>
            )}
            
            {isListening && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="relative">
                  <Mic size={20} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">Continuously listening... Speak anytime!</span>
              </div>
            )}
            
            {!isListening && !isSpeaking && !isProcessingSpeech && (
              <div className="flex items-center gap-2 text-gray-500">
                <Mic size={20} />
                <span className="text-sm font-medium">Ready to listen</span>
              </div>
            )}
          </div>
          
          {/* Text Input Option */}
          {showTextInput && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <h5 className="text-sm font-semibold text-heading text-foreground mb-3">Type Your Question</h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask a question about this tender..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTextInput();
                    }
                  }}
                />
                <button
                  onClick={handleTextInput}
                  disabled={!textInput.trim() || isProcessingSpeech}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Ask
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Press Enter or click Ask to send your question
              </p>
            </div>
          )}
          
          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h5 className="text-sm font-semibold text-heading text-foreground">Conversation History</h5>
              </div>
              <div className="p-4 space-y-4">
                {conversationHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-heading text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Voice Settings */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <h5 className="text-sm font-semibold text-heading text-foreground mb-3">Voice Settings</h5>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-600">Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{voiceSettings.rate}x</span>
              </div>
              <div>
                <label className="text-xs text-gray-600">Pitch</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{voiceSettings.pitch}</span>
              </div>
              <div>
                <label className="text-xs text-gray-600">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{Math.round(voiceSettings.volume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="animate-spin" size={20} />
            Generating Audio Script...
          </>
        ) : (
          <>
            <Mic size={20} />
            {selectedStyle === "interactive" ? "Start Conversation" : `Generate ${styles.find(s => s.value === selectedStyle)?.label}`}
          </>
        )}
      </button>

      {/* Audio Script Display */}
      {audioScript && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          {/* Script Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
                <h4 className="font-bold text-xl mb-2">{audioScript.title}</h4>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span className="capitalize">{audioScript.style.replace("-", " ")}</span>
                  <span>•</span>
                  <span>{audioScript.duration}</span>
                  <span>•</span>
                  <span>{audioScript.metadata?.wordCount || 0} words</span>
                  <span>•</span>
                  <span>{audioScript.metadata?.speakingRate || 150} WPM</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    audioScript.metadata?.complexity === "beginner" ? "bg-green-500" :
                    audioScript.metadata?.complexity === "intermediate" ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}>
                    {audioScript.metadata?.complexity || 'intermediate'}
                  </div>
                  <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                    {audioScript.metadata?.tone || 'professional'}
                  </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={togglePlayback}
                  className="p-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              {(isPlaying || isSpeaking) && (
                <button
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    if (isPlaying) setIsPlaying(false);
                  }}
                  className="p-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                  title="Stop Audio"
                >
                  <VolumeX size={20} />
                </button>
              )}
              <button
                onClick={handleDownload}
                  className="p-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                title="Download Script"
              >
                  <Download size={20} />
              </button>
              </div>
            </div>
          </div>

          {/* Interactive Controls */}
          {interactiveMode === "preview" && (
            <div className="bg-muted border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={previousSection}
                    disabled={currentSection === 0}
                    className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <SkipBack size={16} />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume1 size={16} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(Number(e.target.value) === 0);
                      }}
                      className="w-20"
                    />
                  </div>
                  
                  <button
                    onClick={nextSection}
                    disabled={currentSection === audioScript.sections.length - 1}
                    className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <SkipForward size={16} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Speed:</span>
                  <select
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Script Content */}
          <div className="p-6">
            {isEditing && interactiveMode === "edit" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-heading text-foreground">Edit Script</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdits}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
                <textarea
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Edit your audio script here..."
                />
              </div>
            ) : (
              <div className="space-y-4">
                {interactiveMode === "preview" && audioScript.sections.length > 0 ? (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {audioScript.sections[currentSection].speaker && (
                        <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                          {audioScript.sections[currentSection].speaker}
                        </span>
                      )}
                      <span className="text-sm text-blue-600">{audioScript.sections[currentSection].timestamp}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{audioScript.sections[currentSection].text}</p>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {audioScript.script}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {interactiveMode === "preview" && audioScript.sections.length > 0 && (
            <div className="bg-gray-100 px-6 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Section {currentSection + 1} of {audioScript.sections.length}</span>
                <span className="text-sm text-gray-500">
                  ({audioScript.sections[currentSection].duration}s)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSection + 1) / audioScript.sections.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Audio Note */}
          <div className="bg-blue-50 border-t border-blue-200 p-4">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>AI-Powered Audio Generation:</strong> This script is optimized for text-to-speech conversion. 
                For best results, use services like Google Cloud TTS, Amazon Polly, or ElevenLabs with the recommended 
                speaking rate of {audioScript.metadata?.speakingRate || 150} WPM and {audioScript.metadata?.tone || 'professional'} tone.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!audioScript && !isGenerating && (
        <div className="text-center py-12 bg-muted rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Volume2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-heading text-foreground mb-2">No audio script generated yet</h3>
          <p className="text-gray-600 mb-4">Select a style and click Generate to create a professional audio overview</p>
          
          {/* Quick Play Button for Empty State */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Generate & Play Audio
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles size={16} />
            <span>AI-powered • Multiple styles • Interactive preview</span>
          </div>
        </div>
      )}
    </div>
  );
}

