"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BookOpen, HelpCircle, RotateCcw, CheckCircle, XCircle, ArrowRight, ArrowLeft,
  Plus, Edit3, Trash2, Save, Download, Upload, Settings, Share2, Copy,
  Eye, Maximize2, Users, Zap, Sparkles, Target, BarChart3, TrendingUp,
  Calendar, Clock, User, Tag, Filter, Search, ChevronDown, ChevronRight,
  ChevronUp, ChevronLeft, MoreHorizontal, Star, Heart, Bookmark, Volume2,
  VolumeX, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Layers,
  FileText, Image, Video, Music, AlertCircle, Info, CheckSquare, Square,
  Minus, RefreshCw, Send, Mail, MessageSquare, Award, Trophy, Medal
} from "lucide-react";

interface FlashcardsPanelProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

type CardType = "basic" | "multiple-choice" | "true-false" | "fill-blank" | "image" | "audio";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  type: CardType;
  difficulty: DifficultyLevel;
  category: string;
  tags: string[];
  metadata: {
    created: string;
    modified: string;
    author: string;
    views: number;
    correct: number;
    incorrect: number;
    lastStudied?: string;
  };
  media?: {
    image?: string;
    audio?: string;
    video?: string;
  };
  hints?: string[];
  explanation?: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  metadata: {
    created: string;
    modified: string;
    author: string;
    totalCards: number;
    averageDifficulty: DifficultyLevel;
    studyTime: number;
    completionRate: number;
  };
  settings: {
    shuffle: boolean;
    repeat: boolean;
    showHints: boolean;
    autoAdvance: boolean;
    studyMode: "normal" | "spaced-repetition" | "cramming";
  };
}

const difficultyColors = {
  easy: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  hard: "bg-orange-100 text-orange-700 border-orange-300",
  expert: "bg-red-100 text-red-700 border-red-300"
};

const cardTypeIcons = {
  basic: <FileText size={16} />,
  "multiple-choice": <HelpCircle size={16} />,
  "true-false": <CheckSquare size={16} />,
  "fill-blank": <Edit3 size={16} />,
  image: <Image size={16} />,
  audio: <Volume2 size={16} />
};

export function FlashcardsPanel({ tenderId, interactiveMode = "preview" }: FlashcardsPanelProps) {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [studyMode, setStudyMode] = useState<"normal" | "spaced-repetition" | "cramming">("normal");
  const [isShuffled, setIsShuffled] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0,
    totalTime: 0,
    streak: 0
  });
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentationMode, setPresentationMode] = useState<"slide" | "fullscreen">("slide");
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(5);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState({ width: 400, height: 300 });

  const generateFlashcards = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tenderId: tenderId || "default",
          type: "flashcards",
          interactiveMode,
          settings: {
            difficulty: "medium",
            count: 20,
            categories: ["requirements", "compliance", "risks", "timeline"]
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newSet: FlashcardSet = {
          id: `set-${Date.now()}`,
          title: data.title || "Generated Flashcard Set",
          description: data.description || "AI-generated flashcards from tender documents",
          cards: data.flashcards?.map((card: any, index: number) => ({
            id: `card-${index}`,
            question: card.question,
            answer: card.answer,
            type: "basic" as CardType,
            difficulty: card.difficulty || "medium",
            category: card.category || "general",
            tags: card.tags || [],
            metadata: {
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
              author: "AI Assistant",
              views: 0,
              correct: 0,
              incorrect: 0
            },
            hints: card.hints || [],
            explanation: card.explanation
          })) || [],
          metadata: {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            author: "AI Assistant",
            totalCards: data.flashcards?.length || 0,
            averageDifficulty: "medium",
            studyTime: 0,
            completionRate: 0
          },
          settings: {
            shuffle: false,
            repeat: false,
            showHints: true,
            autoAdvance: false,
            studyMode: "normal"
          }
        };
        
        setFlashcardSets(prev => [newSet, ...prev]);
        setCurrentSet(newSet);
        showNotification("Flashcards generated successfully!", "success");
      } else {
        showNotification("Failed to generate flashcards", "error");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      showNotification("Failed to generate flashcards", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const addNewCard = () => {
    if (!currentSet) return;
    
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      question: "New Question",
      answer: "New Answer",
      type: "basic",
      difficulty: "medium",
      category: "general",
      tags: [],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: "User",
        views: 0,
        correct: 0,
        incorrect: 0
      }
    };

    const updatedSet = {
      ...currentSet,
      cards: [...currentSet.cards, newCard],
      metadata: {
        ...currentSet.metadata,
        totalCards: currentSet.cards.length + 1,
        modified: new Date().toISOString()
      }
    };

    setCurrentSet(updatedSet);
    setFlashcardSets(prev => prev.map(set => set.id === currentSet.id ? updatedSet : set));
    setEditingCard(newCard);
    setIsEditing(true);
    showNotification("New card added!", "success");
  };

  const editCard = (card: Flashcard) => {
    setEditingCard(card);
    setIsEditing(true);
  };

  const saveCard = () => {
    if (!editingCard || !currentSet) return;

    const updatedCards = currentSet.cards.map(card => 
      card.id === editingCard.id ? {
        ...editingCard,
        metadata: {
          ...editingCard.metadata,
          modified: new Date().toISOString()
        }
      } : card
    );

    const updatedSet = {
      ...currentSet,
      cards: updatedCards,
      metadata: {
        ...currentSet.metadata,
        modified: new Date().toISOString()
      }
    };

    setCurrentSet(updatedSet);
    setFlashcardSets(prev => prev.map(set => set.id === currentSet.id ? updatedSet : set));
    setIsEditing(false);
    setEditingCard(null);
    showNotification("Card saved successfully!", "success");
  };

  const deleteCard = (cardId: string) => {
    if (!currentSet) return;

    const updatedCards = currentSet.cards.filter(card => card.id !== cardId);
    const updatedSet = {
      ...currentSet,
      cards: updatedCards,
      metadata: {
        ...currentSet.metadata,
        totalCards: updatedCards.length,
        modified: new Date().toISOString()
      }
    };

    setCurrentSet(updatedSet);
    setFlashcardSets(prev => prev.map(set => set.id === currentSet.id ? updatedSet : set));
    showNotification("Card deleted successfully!", "success");
  };

  const nextCard = () => {
    if (!currentSet) return;
    
    if (currentCardIndex < currentSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setCurrentHint(0);
    } else if (currentSet.settings.repeat) {
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setCurrentHint(0);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      setCurrentHint(0);
    }
  };

  const shuffleCards = () => {
    if (!currentSet) return;
    
    const shuffledCards = [...currentSet.cards].sort(() => Math.random() - 0.5);
    const shuffledSet = {
      ...currentSet,
      cards: shuffledCards
    };
    
    setCurrentSet(shuffledSet);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsShuffled(true);
    showNotification("Cards shuffled!", "success");
  };

  const markCorrect = () => {
    if (!currentSet) return;
    
    const currentCard = currentSet.cards[currentCardIndex];
    const updatedCards = currentSet.cards.map((card, index) => 
      index === currentCardIndex ? {
        ...card,
        metadata: {
          ...card.metadata,
          correct: card.metadata.correct + 1,
          lastStudied: new Date().toISOString()
        }
      } : card
    );

    const updatedSet = {
      ...currentSet,
      cards: updatedCards
    };

    setCurrentSet(updatedSet);
    setStudyStats(prev => ({
      ...prev,
      correct: prev.correct + 1,
      streak: prev.streak + 1
    }));
    
    nextCard();
  };

  const markIncorrect = () => {
    if (!currentSet) return;
    
    const currentCard = currentSet.cards[currentCardIndex];
    const updatedCards = currentSet.cards.map((card, index) => 
      index === currentCardIndex ? {
        ...card,
        metadata: {
          ...card.metadata,
          incorrect: card.metadata.incorrect + 1,
          lastStudied: new Date().toISOString()
        }
      } : card
    );

    const updatedSet = {
      ...currentSet,
      cards: updatedCards
    };

    setCurrentSet(updatedSet);
    setStudyStats(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1,
      streak: 0
    }));
    
    nextCard();
  };

  const startPresentation = () => {
    setIsPresenting(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const exportFlashcards = () => {
    if (!currentSet) return;

    const exportData = {
      title: currentSet.title,
      description: currentSet.description,
      cards: currentSet.cards.map(card => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        category: card.category,
        tags: card.tags
      })),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSet.title.replace(/[^a-zA-Z0-9]/g, '-')}-flashcards.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification("Flashcards exported successfully!", "success");
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

  const currentCard = currentSet?.cards[currentCardIndex];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BookOpen className="text-indigo-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-heading text-foreground">Flashcards</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getModeColor()}`}>
              {getModeIcon()}
              {interactiveMode.charAt(0).toUpperCase() + interactiveMode.slice(1)} Mode
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          {currentSet && (
            <button
              onClick={exportFlashcards}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              title="Export Flashcards"
            >
              <Download size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-muted rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-heading text-foreground">Study Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Study Mode</label>
              <select
                value={studyMode}
                onChange={(e) => setStudyMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="normal">Normal</option>
                <option value="spaced-repetition">Spaced Repetition</option>
                <option value="cramming">Cramming</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Auto Advance</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Enable</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flashcard Sets */}
      {!currentSet && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-heading text-foreground">Flashcard Sets</h4>
            <button
              onClick={generateFlashcards}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Generate Flashcards
                </>
              )}
            </button>
          </div>

          {flashcardSets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <BookOpen size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-heading text-foreground mb-2">No flashcard sets yet</h3>
              <p className="text-gray-600 mb-4">
                Generate flashcards from your tender documents to start studying
              </p>
              <button
                onClick={generateFlashcards}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors mx-auto"
              >
                <Zap size={16} />
                Generate First Set
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flashcardSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => setCurrentSet(set)}
                  className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-semibold text-heading text-foreground">{set.title}</h5>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[set.metadata.averageDifficulty]}`}>
                      {set.metadata.averageDifficulty}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{set.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{set.metadata.totalCards} cards</span>
                    <span>•</span>
                    <span>{set.metadata.completionRate}% complete</span>
                    <span>•</span>
                    <span>{new Date(set.metadata.created).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Flashcard Set */}
      {currentSet && !isEditing && (
        <div className="space-y-4">
          {/* Set Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-heading text-foreground">{currentSet.title}</h4>
              <p className="text-sm text-gray-600">{currentSet.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {interactiveMode === "edit" && (
                <button
                  onClick={addNewCard}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Card
                </button>
              )}
              <button
                onClick={() => setCurrentSet(null)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Sets
              </button>
            </div>
          </div>

          {/* Study Stats */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{studyStats.correct}</div>
                <div className="text-xs text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{studyStats.incorrect}</div>
                <div className="text-xs text-gray-600">Incorrect</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{studyStats.streak}</div>
                <div className="text-xs text-gray-600">Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{Math.round((studyStats.correct / (studyStats.correct + studyStats.incorrect)) * 100) || 0}%</div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Flashcard Display */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
            {/* Progress Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Card {currentCardIndex + 1} of {currentSet.cards.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={shuffleCards}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Shuffle Cards"
                  >
                    <Shuffle size={16} />
                  </button>
                  {interactiveMode === "present" && (
                    <button
                      onClick={startPresentation}
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Start Presentation"
                    >
                      <Maximize2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentCardIndex + 1) / currentSet.cards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Card Content */}
            <div className="p-8 min-h-[400px] flex items-center justify-center">
              {currentCard && (
                <div 
                  ref={cardRef}
                  className="w-full max-w-2xl mx-auto"
                >
                  <div className="text-center space-y-6">
                    {/* Question */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[currentCard.difficulty]}`}>
                          {currentCard.difficulty}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          {cardTypeIcons[currentCard.type]}
                          <span className="text-xs">{currentCard.type}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-heading text-foreground leading-relaxed">
                        {currentCard.question}
                      </h3>

                      {/* Hints */}
                      {showHints && currentCard.hints && currentCard.hints.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Info size={16} className="text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Hint {currentHint + 1}</span>
                          </div>
                          <p className="text-sm text-yellow-700">{currentCard.hints[currentHint]}</p>
                          {currentCard.hints.length > 1 && (
                            <button
                              onClick={() => setCurrentHint((currentHint + 1) % currentCard.hints!.length)}
                              className="mt-2 text-xs text-yellow-600 hover:text-yellow-800"
                            >
                              Next Hint
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Answer */}
                    {showAnswer && (
                      <div className="bg-muted rounded-lg p-6 border-l-4 border-indigo-500">
                        <h4 className="text-lg font-semibold text-heading text-foreground mb-3">Answer:</h4>
                        <p className="text-gray-700 leading-relaxed mb-4">{currentCard.answer}</p>
                        
                        {currentCard.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-blue-800 mb-2">Explanation:</h5>
                            <p className="text-sm text-blue-700">{currentCard.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-4">
                      {!showAnswer ? (
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                          Show Answer
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <button
                              onClick={markCorrect}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={16} />
                              Correct
                            </button>
                            <button
                              onClick={markIncorrect}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <XCircle size={16} />
                              Incorrect
                            </button>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={prevCard}
                              disabled={currentCardIndex === 0}
                              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <ArrowLeft size={16} />
                              Previous
                            </button>
                            <button
                              onClick={nextCard}
                              disabled={currentCardIndex === currentSet.cards.length - 1}
                              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                              Next
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card Management */}
          {interactiveMode === "edit" && (
            <div className="bg-muted rounded-lg p-4">
              <h5 className="text-sm font-semibold text-heading text-foreground mb-3">Card Management</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentSet.cards.map((card, index) => (
                  <div
                    key={card.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      index === currentCardIndex ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setCurrentCardIndex(index);
                      setShowAnswer(false);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-heading text-foreground">Card {index + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editCard(card);
                          }}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCard(card.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{card.question}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`px-2 py-1 rounded text-xs ${difficultyColors[card.difficulty]}`}>
                        {card.difficulty}
                      </div>
                      <span className="text-xs text-gray-500">{card.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Editor */}
      {isEditing && editingCard && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-heading text-foreground">Edit Card</h4>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingCard(null);
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCard}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Card
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Question</label>
              <textarea
                value={editingCard.question}
                onChange={(e) => setEditingCard(prev => prev ? { ...prev, question: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Answer</label>
              <textarea
                value={editingCard.answer}
                onChange={(e) => setEditingCard(prev => prev ? { ...prev, answer: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty</label>
                <select
                  value={editingCard.difficulty}
                  onChange={(e) => setEditingCard(prev => prev ? { ...prev, difficulty: e.target.value as DifficultyLevel } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <input
                  type="text"
                  value={editingCard.category}
                  onChange={(e) => setEditingCard(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!currentSet && !isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>AI-Powered Flashcards:</strong> Generate personalized flashcards from your tender documents. 
              Study with spaced repetition, track your progress, and master key concepts efficiently.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
