"use client";

import { useState, useEffect } from "react";
import { BookOpen, HelpCircle, RotateCcw, CheckCircle, XCircle, ArrowRight, ArrowLeft } from "lucide-react";

type Flashcard = {
  question: string;
  answer: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
};

type StudyTools = {
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
};

export function StudyTools({ tenderId }: { tenderId?: string }) {
  const [studyTools, setStudyTools] = useState<StudyTools | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<"flashcards" | "quiz">("flashcards");
  
  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const generateStudyTools = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenderId: tenderId || "default" }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudyTools(data);
      } else {
        alert("Failed to generate study tools. Please try again.");
      }
    } catch (error) {
      console.error("Error generating study tools:", error);
      alert("Failed to generate study tools. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (studyTools && currentCardIndex < studyTools.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const resetCards = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const selectAnswer = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
      const isCorrect = index === studyTools?.quiz[currentQuestionIndex].correct;
      setQuizScore([...quizScore, isCorrect ? 1 : 0]);
    }
  };

  const nextQuestion = () => {
    if (studyTools && currentQuestionIndex < studyTools.quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowQuizResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore([]);
    setShowQuizResult(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold">Study Tools</h3>
        </div>
        <button
          onClick={generateStudyTools}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating..." : "Generate Study Tools"}
        </button>
      </div>

      {studyTools && (
        <>
          {/* Mode Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveMode("flashcards")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeMode === "flashcards"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BookOpen size={16} className="inline mr-2" />
              Flashcards ({studyTools.flashcards.length})
            </button>
            <button
              onClick={() => setActiveMode("quiz")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeMode === "quiz"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <HelpCircle size={16} className="inline mr-2" />
              Quiz ({studyTools.quiz.length})
            </button>
          </div>

          {/* Flashcards Mode */}
          {activeMode === "flashcards" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  Card {currentCardIndex + 1} of {studyTools.flashcards.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCardIndex + 1) / studyTools.flashcards.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="min-h-48 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="text-lg font-medium text-gray-900 mb-4">
                    {studyTools.flashcards[currentCardIndex]?.question}
                  </div>
                  
                  {showAnswer && (
                    <div className="text-gray-700 mb-6 p-4 bg-gray-50 rounded-lg">
                      {studyTools.flashcards[currentCardIndex]?.answer}
                    </div>
                  )}

                  <div className="space-y-3">
                    {!showAnswer ? (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowAnswer(false)}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Hide Answer
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={prevCard}
                            disabled={currentCardIndex === 0}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                          >
                            <ArrowLeft size={16} className="inline mr-1" />
                            Previous
                          </button>
                          <button
                            onClick={nextCard}
                            disabled={currentCardIndex === studyTools.flashcards.length - 1}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                          >
                            Next
                            <ArrowRight size={16} className="inline ml-1" />
                          </button>
                        </div>
                        <button
                          onClick={resetCards}
                          className="w-full px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                          <RotateCcw size={16} className="inline mr-1" />
                          Start Over
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Mode */}
          {activeMode === "quiz" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {!showQuizResult ? (
                <>
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Question {currentQuestionIndex + 1} of {studyTools.quiz.length}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / studyTools.quiz.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-lg font-medium text-gray-900 mb-4">
                      {studyTools.quiz[currentQuestionIndex]?.question}
                    </div>
                    
                    <div className="space-y-2">
                      {studyTools.quiz[currentQuestionIndex]?.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => selectAnswer(index)}
                          disabled={selectedAnswer !== null}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedAnswer === index
                              ? index === studyTools.quiz[currentQuestionIndex].correct
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-red-500 bg-red-50 text-red-700"
                              : selectedAnswer !== null && index === studyTools.quiz[currentQuestionIndex].correct
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                            <span>{option}</span>
                            {selectedAnswer !== null && index === studyTools.quiz[currentQuestionIndex].correct && (
                              <CheckCircle size={16} className="text-green-600 ml-auto" />
                            )}
                            {selectedAnswer === index && index !== studyTools.quiz[currentQuestionIndex].correct && (
                              <XCircle size={16} className="text-red-600 ml-auto" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedAnswer !== null && (
                    <div className="text-center">
                      <button
                        onClick={nextQuestion}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {currentQuestionIndex < studyTools.quiz.length - 1 ? "Next Question" : "Finish Quiz"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold mb-4">
                    Quiz Complete!
                  </div>
                  <div className={`text-3xl font-bold mb-4 ${getScoreColor(quizScore.reduce((a, b) => a + b, 0) / quizScore.length)}`}>
                    {Math.round((quizScore.reduce((a, b) => a + b, 0) / quizScore.length) * 100)}%
                  </div>
                  <div className="text-gray-600 mb-6">
                    You got {quizScore.reduce((a, b) => a + b, 0)} out of {quizScore.length} questions correct.
                  </div>
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RotateCcw size={16} className="inline mr-2" />
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!studyTools && !loading && (
        <div className="text-center py-8 text-gray-500">
          <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Generate study tools to create flashcards and quizzes from your tender documents.</p>
        </div>
      )}
    </div>
  );
}
