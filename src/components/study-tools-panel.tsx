"use client";

import { useEffect, useState } from "react";
import { BookOpen, HelpCircle, RotateCcw } from "lucide-react";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  category: string;
  source?: string;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
};

export function StudyToolsPanel() {
  const [activeTab, setActiveTab] = useState<"flashcards" | "quiz">("flashcards");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    if (activeTab === "flashcards") {
      fetch("/api/study-tools?type=flashcards")
        .then((r) => r.json())
        .then((d) => setFlashcards(d.flashcards ?? []))
        .catch(() => {});
    } else {
      fetch("/api/study-tools?type=quiz")
        .then((r) => r.json())
        .then((d) => setQuizQuestions(d.questions ?? []))
        .catch(() => {});
    }
  }, [activeTab]);

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setShowAnswer(false);
  };

  const handleQuizAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === quizQuestions[currentQuizIndex]?.correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const nextQuiz = () => {
    setCurrentQuizIndex((prev) => prev + 1);
    setSelectedAnswer(null);
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
  };

  const currentCard = flashcards[currentCardIndex];
  const currentQuestion = quizQuestions[currentQuizIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Study Tools:</div>
        <div className="flex gap-2">
          <button
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              activeTab === "flashcards" 
                ? "bg-blue-600 text-white" 
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => setActiveTab("flashcards")}
          >
            <BookOpen size={14} className="inline mr-1" />
            Cards
          </button>
          <button
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              activeTab === "quiz" 
                ? "bg-blue-600 text-white" 
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => setActiveTab("quiz")}
          >
            <HelpCircle size={14} className="inline mr-1" />
            Quiz
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {activeTab === "flashcards" ? (
          <div className="space-y-4">
            {flashcards.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">
                No flashcards available. Upload documents to generate study materials.
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground text-center">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </div>
                <div className="rounded-lg border border-border p-4 bg-card min-h-[120px] flex flex-col justify-center">
                  <div className="text-sm font-medium mb-2">{currentCard?.question}</div>
                  {showAnswer ? (
                    <div className="text-sm">{currentCard?.answer}</div>
                  ) : (
                    <button
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      onClick={() => setShowAnswer(true)}
                    >
                      Click to reveal answer
                    </button>
                  )}
                  {currentCard?.source && (
                    <div className="text-xs text-muted-foreground mt-3">{currentCard.source}</div>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    onClick={prevCard}
                  >
                    Previous
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    onClick={nextCard}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {quizQuestions.length === 0 ? (
              <div className="text-sm opacity-70 text-center py-4">
                No quiz questions available. Upload documents to generate study materials.
              </div>
            ) : currentQuizIndex >= quizQuestions.length ? (
              <div className="text-center py-4">
                <div className="text-sm font-medium mb-2">Quiz Complete!</div>
                <div className="text-sm opacity-70 mb-3">
                  Score: {quizScore}/{quizQuestions.length}
                </div>
                <button
                  className="text-xs px-3 py-1 rounded bg-black/5 dark:bg-white/5"
                  onClick={resetQuiz}
                >
                  <RotateCcw size={12} className="inline mr-1" />
                  Retake Quiz
                </button>
              </div>
            ) : (
              <>
                <div className="text-xs opacity-70 text-center">
                  Question {currentQuizIndex + 1} of {quizQuestions.length}
                </div>
                <div className="rounded border border-foreground/15 p-4 bg-black/5 dark:bg-white/5">
                  <div className="text-sm font-medium mb-3">{currentQuestion?.question}</div>
                  <div className="space-y-2">
                    {currentQuestion?.options.map((option) => (
                      <button
                        key={option}
                        className={`w-full text-left text-sm px-3 py-2 rounded ${
                          selectedAnswer === option
                            ? option === currentQuestion.correct
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                            : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                        }`}
                        onClick={() => handleQuizAnswer(option)}
                        disabled={!!selectedAnswer}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {selectedAnswer && (
                    <div className="mt-3 text-xs opacity-70">
                      {currentQuestion?.explanation}
                    </div>
                  )}
                </div>
                {selectedAnswer && (
                  <button
                    className="w-full text-xs px-3 py-1 rounded bg-black/5 dark:bg-white/5"
                    onClick={nextQuiz}
                  >
                    Next Question
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
