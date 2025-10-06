"use client";

import { useState, useEffect, useRef } from "react";
import { 
  HelpCircle, RotateCcw, CheckCircle, XCircle, ArrowRight, ArrowLeft,
  Plus, Edit3, Trash2, Save, Download, Upload, Settings, Share2, Copy,
  Eye, Maximize2, Users, Zap, Sparkles, Target, BarChart3, TrendingUp,
  Calendar, Clock, User, Tag, Filter, Search, ChevronDown, ChevronRight,
  ChevronUp, ChevronLeft, MoreHorizontal, Star, Heart, Bookmark, Volume2,
  VolumeX, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Layers,
  FileText, Image, Video, Music, AlertCircle, Info, CheckSquare, Square,
  Minus, RefreshCw, Send, Mail, MessageSquare, Award, Trophy, Medal,
  Timer, Clock3, Brain, BookOpen, GraduationCap, Target as TargetIcon
} from "lucide-react";

interface QuizPanelProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

type QuestionType = "multiple-choice" | "true-false" | "fill-blank" | "short-answer" | "essay";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty: DifficultyLevel;
  category: string;
  tags: string[];
  points: number;
  timeLimit?: number;
  metadata: {
    created: string;
    modified: string;
    author: string;
    attempts: number;
    correctAttempts: number;
    averageTime: number;
  };
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  settings: {
    timeLimit?: number;
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    showCorrectAnswers: boolean;
    allowRetake: boolean;
    passingScore: number;
    maxAttempts?: number;
  };
  metadata: {
    created: string;
    modified: string;
    author: string;
    totalQuestions: number;
    totalPoints: number;
    averageDifficulty: DifficultyLevel;
    completionRate: number;
    averageScore: number;
  };
}

interface QuizAttempt {
  id: string;
  quizId: string;
  answers: Record<string, string | number>;
  score: number;
  timeSpent: number;
  completedAt: string;
  passed: boolean;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  hard: "bg-orange-100 text-orange-700 border-orange-300",
  expert: "bg-red-100 text-red-700 border-red-300"
};

const questionTypeIcons = {
  "multiple-choice": <HelpCircle size={16} />,
  "true-false": <CheckSquare size={16} />,
  "fill-blank": <Edit3 size={16} />,
  "short-answer": <FileText size={16} />,
  "essay": <BookOpen size={16} />
};

export function QuizPanel({ tenderId, interactiveMode = "preview" }: QuizPanelProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [quizMode, setQuizMode] = useState<"practice" | "timed" | "exam">("practice");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentationMode, setPresentationMode] = useState<"slide" | "fullscreen">("slide");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tenderId: tenderId || "default",
          type: "quiz",
          interactiveMode,
          settings: {
            questionCount: 15,
            difficulty: "medium",
            questionTypes: ["multiple-choice", "true-false", "fill-blank"],
            categories: ["requirements", "compliance", "risks", "timeline"]
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newQuiz: Quiz = {
          id: `quiz-${Date.now()}`,
          title: data.title || "Generated Quiz",
          description: data.description || "AI-generated quiz from tender documents",
          questions: data.questions?.map((q: any, index: number) => ({
            id: `q-${index}`,
            question: q.question,
            type: q.type || "multiple-choice",
            options: q.options || [],
            correctAnswer: q.correctAnswer || q.correct,
            explanation: q.explanation,
            difficulty: q.difficulty || "medium",
            category: q.category || "general",
            tags: q.tags || [],
            points: q.points || 1,
            timeLimit: q.timeLimit,
            metadata: {
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
              author: "AI Assistant",
              attempts: 0,
              correctAttempts: 0,
              averageTime: 0
            }
          })) || [],
          settings: {
            timeLimit: data.timeLimit || 30,
            shuffleQuestions: false,
            shuffleAnswers: false,
            showCorrectAnswers: true,
            allowRetake: true,
            passingScore: 70,
            maxAttempts: 3
          },
          metadata: {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            author: "AI Assistant",
            totalQuestions: data.questions?.length || 0,
            totalPoints: data.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 0,
            averageDifficulty: "medium",
            completionRate: 0,
            averageScore: 0
          }
        };
        
        setQuizzes(prev => [newQuiz, ...prev]);
        setCurrentQuiz(newQuiz);
        showNotification("Quiz generated successfully!", "success");
      } else {
        showNotification("Failed to generate quiz", "error");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      showNotification("Failed to generate quiz", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = () => {
    if (!currentQuiz) return;
    
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setShowResults(false);
    setQuizScore(0);
    startTimeRef.current = Date.now();
    
    if (quizMode === "timed" && currentQuiz.settings.timeLimit) {
      setTimeRemaining(currentQuiz.settings.timeLimit * 60); // Convert minutes to seconds
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    showNotification("Quiz started!", "success");
  };

  const finishQuiz = () => {
    if (!currentQuiz) return;
    
    setQuizCompleted(true);
    setQuizStarted(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const score = calculateScore();
    const passed = score >= currentQuiz.settings.passingScore;
    
    setQuizScore(score);
    
    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: currentQuiz.id,
      answers: userAnswers,
      score,
      timeSpent,
      completedAt: new Date().toISOString(),
      passed
    };
    
    setQuizAttempts(prev => [attempt, ...prev]);
    setShowResults(true);
    
    showNotification(`Quiz completed! Score: ${score}%`, passed ? "success" : "info");
  };

  const calculateScore = () => {
    if (!currentQuiz) return 0;
    
    let correctAnswers = 0;
    let totalPoints = 0;
    
    currentQuiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = userAnswers[question.id];
      
      if (userAnswer !== undefined) {
        if (question.type === "multiple-choice" || question.type === "true-false") {
          if (userAnswer === question.correctAnswer) {
            correctAnswers += question.points;
          }
        } else {
          // For text-based answers, we'd need more sophisticated checking
          // For now, assume partial credit
          correctAnswers += question.points * 0.8;
        }
      }
    });
    
    return Math.round((correctAnswers / totalPoints) * 100);
  };

  const nextQuestion = () => {
    if (!currentQuiz) return;
    
    // Save current answer
    if (selectedAnswer !== null) {
      setUserAnswers(prev => ({
        ...prev,
        [currentQuiz.questions[currentQuestionIndex].id]: selectedAnswer
      }));
    }
    
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuiz.questions[currentQuestionIndex + 1].id] || null);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[currentQuiz.questions[currentQuestionIndex - 1].id] || null);
    }
  };

  const selectAnswer = (answer: string | number) => {
    setSelectedAnswer(answer);
  };

  const addNewQuestion = () => {
    if (!currentQuiz) return;
    
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: "New Question",
      type: "multiple-choice",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      difficulty: "medium",
      category: "general",
      tags: [],
      points: 1,
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: "User",
        attempts: 0,
        correctAttempts: 0,
        averageTime: 0
      }
    };

    const updatedQuiz = {
      ...currentQuiz,
      questions: [...currentQuiz.questions, newQuestion],
      metadata: {
        ...currentQuiz.metadata,
        totalQuestions: currentQuiz.questions.length + 1,
        totalPoints: currentQuiz.metadata.totalPoints + 1,
        modified: new Date().toISOString()
      }
    };

    setCurrentQuiz(updatedQuiz);
    setQuizzes(prev => prev.map(q => q.id === currentQuiz.id ? updatedQuiz : q));
    setEditingQuestion(newQuestion);
    setIsEditing(true);
    showNotification("New question added!", "success");
  };

  const editQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setIsEditing(true);
  };

  const saveQuestion = () => {
    if (!editingQuestion || !currentQuiz) return;

    const updatedQuestions = currentQuiz.questions.map(q => 
      q.id === editingQuestion.id ? {
        ...editingQuestion,
        metadata: {
          ...editingQuestion.metadata,
          modified: new Date().toISOString()
        }
      } : q
    );

    const updatedQuiz = {
      ...currentQuiz,
      questions: updatedQuestions,
      metadata: {
        ...currentQuiz.metadata,
        modified: new Date().toISOString()
      }
    };

    setCurrentQuiz(updatedQuiz);
    setQuizzes(prev => prev.map(q => q.id === currentQuiz.id ? updatedQuiz : q));
    setIsEditing(false);
    setEditingQuestion(null);
    showNotification("Question saved successfully!", "success");
  };

  const deleteQuestion = (questionId: string) => {
    if (!currentQuiz) return;

    const updatedQuestions = currentQuiz.questions.filter(q => q.id !== questionId);
    const updatedQuiz = {
      ...currentQuiz,
      questions: updatedQuestions,
      metadata: {
        ...currentQuiz.metadata,
        totalQuestions: updatedQuestions.length,
        totalPoints: updatedQuestions.reduce((sum, q) => sum + q.points, 0),
        modified: new Date().toISOString()
      }
    };

    setCurrentQuiz(updatedQuiz);
    setQuizzes(prev => prev.map(q => q.id === currentQuiz.id ? updatedQuiz : q));
    showNotification("Question deleted successfully!", "success");
  };

  const retakeQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedAnswer(null);
    setQuizScore(0);
    setTimeRemaining(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const exportQuiz = () => {
    if (!currentQuiz) return;

    const exportData = {
      title: currentQuiz.title,
      description: currentQuiz.description,
      questions: currentQuiz.questions.map(q => ({
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        category: q.category,
        points: q.points
      })),
      settings: currentQuiz.settings,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentQuiz.title.replace(/[^a-zA-Z0-9]/g, '-')}-quiz.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification("Quiz exported successfully!", "success");
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <HelpCircle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-heading text-foreground">Quiz Generator</h3>
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
          {currentQuiz && (
            <button
              onClick={exportQuiz}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              title="Export Quiz"
            >
              <Download size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-muted rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-heading text-foreground">Quiz Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Quiz Mode</label>
              <select
                value={quizMode}
                onChange={(e) => setQuizMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="practice">Practice Mode</option>
                <option value="timed">Timed Mode</option>
                <option value="exam">Exam Mode</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Passing Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={currentQuiz?.settings.passingScore || 70}
                onChange={(e) => {
                  if (currentQuiz) {
                    const updatedQuiz = {
                      ...currentQuiz,
                      settings: {
                        ...currentQuiz.settings,
                        passingScore: parseInt(e.target.value)
                      }
                    };
                    setCurrentQuiz(updatedQuiz);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quiz List */}
      {!currentQuiz && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-heading text-foreground">Available Quizzes</h4>
            <button
              onClick={generateQuiz}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Generate Quiz
                </>
              )}
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <HelpCircle size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-heading text-foreground mb-2">No quizzes yet</h3>
              <p className="text-gray-600 mb-4">
                Generate quizzes from your tender documents to test knowledge
              </p>
              <button
                onClick={generateQuiz}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors mx-auto"
              >
                <Zap size={16} />
                Generate First Quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => setCurrentQuiz(quiz)}
                  className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-semibold text-heading text-foreground">{quiz.title}</h5>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[quiz.metadata.averageDifficulty]}`}>
                      {quiz.metadata.averageDifficulty}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{quiz.metadata.totalQuestions} questions</span>
                    <span>•</span>
                    <span>{quiz.metadata.totalPoints} points</span>
                    <span>•</span>
                    <span>{quiz.metadata.completionRate}% complete</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Quiz */}
      {currentQuiz && !isEditing && (
        <div className="space-y-4">
          {/* Quiz Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-heading text-foreground">{currentQuiz.title}</h4>
              <p className="text-sm text-gray-600">{currentQuiz.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {interactiveMode === "edit" && (
                <button
                  onClick={addNewQuestion}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Question
                </button>
              )}
              <button
                onClick={() => setCurrentQuiz(null)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Quizzes
              </button>
            </div>
          </div>

          {/* Quiz Stats */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">{currentQuiz.metadata.totalQuestions}</div>
                <div className="text-xs text-gray-600">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{currentQuiz.metadata.totalPoints}</div>
                <div className="text-xs text-gray-600">Total Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{currentQuiz.settings.passingScore}%</div>
                <div className="text-xs text-gray-600">Passing Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{quizAttempts.length}</div>
                <div className="text-xs text-gray-600">Attempts</div>
              </div>
            </div>
          </div>

          {/* Quiz Content */}
          {!quizStarted && !showResults && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <HelpCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-heading text-foreground mb-2">Ready to Start?</h3>
              <p className="text-gray-600 mb-6">
                This quiz contains {currentQuiz.metadata.totalQuestions} questions worth {currentQuiz.metadata.totalPoints} points total.
                {quizMode === "timed" && currentQuiz.settings.timeLimit && (
                  <span> You have {currentQuiz.settings.timeLimit} minutes to complete it.</span>
                )}
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={startQuiz}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          )}

          {/* Quiz Questions */}
          {quizStarted && currentQuestion && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
              {/* Progress Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                  </span>
                  {timeRemaining !== null && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <Timer size={16} />
                      <span>{formatTime(timeRemaining)}</span>
                    </div>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Content */}
              <div className="p-8">
                <div className="space-y-6">
                  {/* Question Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[currentQuestion.difficulty]}`}>
                      {currentQuestion.difficulty}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      {questionTypeIcons[currentQuestion.type]}
                      <span className="text-xs">{currentQuestion.type}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Question */}
                  <h3 className="text-xl font-semibold text-heading text-foreground leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                      currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => selectAnswer(index)}
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${
                            selectedAnswer === index
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-gray-200 hover:border-gray-300 hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                            <span>{option}</span>
                          </div>
                        </button>
                      ))
                    )}

                    {currentQuestion.type === "true-false" && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => selectAnswer(true)}
                          className={`p-4 rounded-lg border transition-colors ${
                            selectedAnswer === true
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 hover:border-gray-300 hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle size={20} />
                            <span className="font-medium">True</span>
                          </div>
                        </button>
                        <button
                          onClick={() => selectAnswer(false)}
                          className={`p-4 rounded-lg border transition-colors ${
                            selectedAnswer === false
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-gray-200 hover:border-gray-300 hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <XCircle size={20} />
                            <span className="font-medium">False</span>
                          </div>
                        </button>
                      </div>
                    )}

                    {(currentQuestion.type === "fill-blank" || currentQuestion.type === "short-answer") && (
                      <textarea
                        value={selectedAnswer as string || ""}
                        onChange={(e) => selectAnswer(e.target.value)}
                        placeholder="Enter your answer here..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      onClick={prevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </button>
                    
                    <button
                      onClick={nextQuestion}
                      disabled={selectedAnswer === null}
                      className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {currentQuestionIndex === currentQuiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Results */}
          {showResults && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Trophy size={32} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-heading text-foreground mb-2">Quiz Complete!</h3>
              <div className={`text-4xl font-bold mb-4 ${
                quizScore >= currentQuiz.settings.passingScore ? "text-green-600" : "text-red-600"
              }`}>
                {quizScore}%
              </div>
              <p className="text-gray-600 mb-6">
                {quizScore >= currentQuiz.settings.passingScore ? "Congratulations! You passed!" : "Keep studying to improve your score."}
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={retakeQuiz}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RotateCcw size={16} className="inline mr-2" />
                  Retake Quiz
                </button>
                <button
                  onClick={() => setCurrentQuiz(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Quizzes
                </button>
              </div>
            </div>
          )}

          {/* Question Management */}
          {interactiveMode === "edit" && (
            <div className="bg-muted rounded-lg p-4">
              <h5 className="text-sm font-semibold text-heading text-foreground mb-3">Question Management</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentQuiz.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      index === currentQuestionIndex ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setSelectedAnswer(userAnswers[question.id] || null);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-heading text-foreground">Q{index + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editQuestion(question);
                          }}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(question.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{question.question}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`px-2 py-1 rounded text-xs ${difficultyColors[question.difficulty]}`}>
                        {question.difficulty}
                      </div>
                      <span className="text-xs text-gray-500">{question.points}pt</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question Editor */}
      {isEditing && editingQuestion && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-heading text-foreground">Edit Question</h4>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingQuestion(null);
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveQuestion}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Save Question
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Question</label>
              <textarea
                value={editingQuestion.question}
                onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, question: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                <select
                  value={editingQuestion.type}
                  onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, type: e.target.value as QuestionType } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="fill-blank">Fill in the Blank</option>
                  <option value="short-answer">Short Answer</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Points</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editingQuestion.points}
                  onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, points: parseInt(e.target.value) } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!currentQuiz && !isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>AI-Powered Quiz Generation:</strong> Create intelligent quizzes from your tender documents. 
              Test knowledge with multiple question types, track progress, and improve learning outcomes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
