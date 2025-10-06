"use client";

import { useState, useEffect } from "react";
import { BookOpen, Brain, FileText, Upload, CheckCircle, XCircle, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";

interface StudyCard {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

export default function StudyToolsPage() {
  const [activeTab, setActiveTab] = useState<"flashcards" | "quiz" | "summary">("flashcards");
  const [studyCards, setStudyCards] = useState<StudyCard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate study materials based on uploaded documents
  const generateStudyMaterials = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call to generate study materials
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample flashcards
      const sampleCards: StudyCard[] = [
        {
          id: "1",
          question: "What is the typical tender submission deadline?",
          answer: "Tender submissions are usually due within 30-45 days from the publication date, but this can vary by project type and complexity.",
          category: "General",
          difficulty: "easy"
        },
        {
          id: "2",
          question: "What are the key components of a winning tender proposal?",
          answer: "A winning proposal typically includes: executive summary, technical approach, project timeline, team qualifications, cost breakdown, risk assessment, and compliance documentation.",
          category: "Strategy",
          difficulty: "medium"
        },
        {
          id: "3",
          question: "How do you calculate win probability for a tender?",
          answer: "Win probability is calculated based on technical fit (40%), commercial competitiveness (30%), compliance readiness (20%), and risk assessment (10%).",
          category: "Analytics",
          difficulty: "hard"
        },
        {
          id: "4",
          question: "What is the importance of compliance in tender submissions?",
          answer: "Compliance ensures your proposal meets all mandatory requirements. Non-compliance can result in immediate disqualification, regardless of technical merit.",
          category: "Compliance",
          difficulty: "medium"
        },
        {
          id: "5",
          question: "How should you structure a technical proposal?",
          answer: "Structure should include: problem understanding, proposed solution, methodology, deliverables, timeline, team structure, and quality assurance measures.",
          category: "Technical",
          difficulty: "medium"
        }
      ];

      // Generate sample quiz questions
      const sampleQuiz: QuizQuestion[] = [
        {
          id: "1",
          question: "What is the most critical factor in tender evaluation?",
          options: ["Lowest price", "Technical compliance", "Company reputation", "Project timeline"],
          correctAnswer: 1,
          explanation: "Technical compliance is the most critical factor as non-compliance leads to immediate disqualification.",
          category: "General"
        },
        {
          id: "2",
          question: "How much weight does commercial competitiveness typically have in scoring?",
          options: ["20%", "30%", "40%", "50%"],
          correctAnswer: 1,
          explanation: "Commercial competitiveness typically accounts for 30% of the total score in most tender evaluations.",
          category: "Scoring"
        },
        {
          id: "3",
          question: "What should you do if you discover an error in your submitted tender?",
          options: ["Ignore it", "Submit a correction immediately", "Wait for evaluation", "Withdraw the tender"],
          correctAnswer: 1,
          explanation: "You should submit a correction immediately if discovered before the deadline, following the proper amendment procedures.",
          category: "Process"
        }
      ];

      setStudyCards(sampleCards);
      setQuizQuestions(sampleQuiz);
    } catch (error) {
      console.error('Error generating study materials:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateStudyMaterials();
  }, []);

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % studyCards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + studyCards.length) % studyCards.length);
    setShowAnswer(false);
  };

  const nextQuiz = () => {
    setCurrentQuizIndex((prev) => (prev + 1) % quizQuestions.length);
  };

  const prevQuiz = () => {
    setCurrentQuizIndex((prev) => (prev - 1 + quizQuestions.length) % quizQuestions.length);
  };

  const selectQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuizIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const calculateQuizScore = () => {
    let correct = 0;
    quizQuestions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    setQuizScore(Math.round((correct / quizQuestions.length) * 100));
  };

  const resetQuiz = () => {
    setQuizAnswers([]);
    setQuizScore(null);
    setCurrentQuizIndex(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "hard": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Study Tools
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            AI-powered study materials generated from your tender documents
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {[
              { id: "flashcards", label: "Flashcards", icon: BookOpen },
              { id: "quiz", label: "Quiz", icon: Brain },
              { id: "summary", label: "Summary", icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {isGenerating ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Generating study materials...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Flashcards */}
            {activeTab === "flashcards" && studyCards.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <div className="text-center mb-6">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    Card {currentCardIndex + 1} of {studyCards.length}
                  </div>
                  <div className="flex justify-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(studyCards[currentCardIndex]?.difficulty)}`}>
                      {studyCards[currentCardIndex]?.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                      {studyCards[currentCardIndex]?.category}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      {showAnswer ? "Answer" : "Question"}
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 text-lg">
                      {showAnswer ? studyCards[currentCardIndex]?.answer : studyCards[currentCardIndex]?.question}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={prevCard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showAnswer ? "Show Question" : "Show Answer"}
                  </button>
                  <button
                    onClick={nextCard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Quiz */}
            {activeTab === "quiz" && quizQuestions.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                {quizScore === null ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        Question {currentQuizIndex + 1} of {quizQuestions.length}
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                        {quizQuestions[currentQuizIndex]?.question}
                      </h3>
                      <div className="space-y-3">
                        {quizQuestions[currentQuizIndex]?.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => selectQuizAnswer(index)}
                            className={`w-full text-left p-4 rounded-lg border transition-colors ${
                              quizAnswers[currentQuizIndex] === index
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={prevQuiz}
                        disabled={currentQuizIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </button>
                      {currentQuizIndex === quizQuestions.length - 1 ? (
                        <button
                          onClick={calculateQuizScore}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Finish Quiz
                        </button>
                      ) : (
                        <button
                          onClick={nextQuiz}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Next
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {quizScore}%
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      Quiz Complete!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      You scored {quizScore}% on the tender knowledge quiz.
                    </p>
                    <button
                      onClick={resetQuiz}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retake Quiz
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            {activeTab === "summary" && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                  Document Summary
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      Key Insights from Your Documents
                    </h4>
                    <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Technical requirements focus on modern infrastructure and digital solutions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Budget range typically falls between $500K - $2M for similar projects</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Compliance requirements include ISO 9001 and environmental certifications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Project timelines average 12-18 months for implementation</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      Study Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Focus Areas</h5>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• Technical compliance requirements</li>
                          <li>• Cost estimation methodologies</li>
                          <li>• Risk management strategies</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">Strengths</h5>
                        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                          <li>• Strong technical team</li>
                          <li>• Proven track record</li>
                          <li>• Competitive pricing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
