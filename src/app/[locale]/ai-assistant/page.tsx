"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, TrendingUp, Calendar, FileText, Users, AlertCircle, CheckCircle } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: any;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI Assistant for Syntara Tenders AI. I can help you with questions about your tenders, provide insights, and answer queries about your projects. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Simulate AI response based on query
      const response = await generateAIResponse(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        data: response.data
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (query: string): Promise<{ content: string; data?: any }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerQuery = query.toLowerCase();

    // Active tenders query
    if (lowerQuery.includes("active") && lowerQuery.includes("tender")) {
      return {
        content: "Based on your current data, you have **3 active tenders** in progress:\n\n• **Highway Infrastructure Project** - Due in 15 days\n• **Software Development Contract** - Due in 8 days\n• **Healthcare Equipment Supply** - Due in 22 days\n\nWould you like me to provide more details about any specific tender?",
        data: {
          type: "tender_summary",
          count: 3,
          tenders: [
            { name: "Highway Infrastructure Project", daysLeft: 15, status: "working" },
            { name: "Software Development Contract", daysLeft: 8, status: "working" },
            { name: "Healthcare Equipment Supply", daysLeft: 22, status: "working" }
          ]
        }
      };
    }

    // Status query
    if (lowerQuery.includes("status") && lowerQuery.includes("submitted")) {
      return {
        content: "Here's the status of your submitted tenders:\n\n• **Government IT Services** - Under Review (Submitted 5 days ago)\n• **Construction Project Alpha** - Shortlisted (Submitted 12 days ago)\n• **Educational Technology** - Pending Decision (Submitted 18 days ago)\n\nYour win rate for submitted tenders is **67%** (2 out of 3).",
        data: {
          type: "submission_status",
          winRate: 67,
          submitted: 3,
          won: 2
        }
      };
    }

    // Due this week query
    if (lowerQuery.includes("due") && (lowerQuery.includes("week") || lowerQuery.includes("this"))) {
      return {
        content: "You have **2 tenders due this week**:\n\n• **Software Development Contract** - Due in 3 days (High Priority)\n• **Digital Marketing Services** - Due in 6 days (Medium Priority)\n\nI recommend focusing on the Software Development Contract first as it has the highest win probability (85%) and is due soonest.",
        data: {
          type: "upcoming_deadlines",
          count: 2,
          tenders: [
            { name: "Software Development Contract", daysLeft: 3, priority: "high", winProbability: 85 },
            { name: "Digital Marketing Services", daysLeft: 6, priority: "medium", winProbability: 60 }
          ]
        }
      };
    }

    // Budget query
    if (lowerQuery.includes("budget") || lowerQuery.includes("value")) {
      return {
        content: "Here's a summary of your tender values:\n\n• **Total Active Tender Value**: $2.4M\n• **Average Tender Value**: $800K\n• **Highest Value Tender**: Highway Infrastructure Project ($1.2M)\n• **Expected Revenue**: $1.6M (based on current win probability)\n\nYour tenders span across multiple sectors including infrastructure, technology, and healthcare.",
        data: {
          type: "budget_summary",
          totalValue: 2400000,
          averageValue: 800000,
          expectedRevenue: 1600000
        }
      };
    }

    // Team query
    if (lowerQuery.includes("team") || lowerQuery.includes("member")) {
      return {
        content: "Your team consists of **5 active members**:\n\n• **John Smith** - Project Manager (3 active projects)\n• **Sarah Johnson** - Technical Lead (2 active projects)\n• **Mike Chen** - Bid Writer (4 active projects)\n• **Emily Davis** - Analyst (2 active projects)\n• **David Wilson** - Coordinator (1 active project)\n\nTeam utilization is at **85%** with good workload distribution.",
        data: {
          type: "team_summary",
          totalMembers: 5,
          utilization: 85,
          members: [
            { name: "John Smith", role: "Project Manager", projects: 3 },
            { name: "Sarah Johnson", role: "Technical Lead", projects: 2 },
            { name: "Mike Chen", role: "Bid Writer", projects: 4 },
            { name: "Emily Davis", role: "Analyst", projects: 2 },
            { name: "David Wilson", role: "Coordinator", projects: 1 }
          ]
        }
      };
    }

    // Default response
    return {
      content: "I can help you with various aspects of your tender management:\n\n• **Tender Status**: Ask about active, submitted, or upcoming tenders\n• **Team Information**: Get details about team members and workload\n• **Budget Analysis**: Understand tender values and expected revenue\n• **Deadlines**: Check upcoming deadlines and priorities\n• **Performance**: Review win rates and success metrics\n\nWhat specific information would you like to know?",
      data: {
        type: "help",
        capabilities: ["tender_status", "team_info", "budget_analysis", "deadlines", "performance"]
      }
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQueries = [
    "How many tenders are currently active?",
    "What is the status of my submitted tenders?",
    "Which tenders are due this week?",
    "What's my team's current workload?",
    "Show me budget analysis for all projects"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            AI Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Get intelligent insights and answers about your tender projects
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[80%] ${
                    message.type === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.data && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                        {message.data.type === "tender_summary" && (
                          <div className="space-y-2">
                            {message.data.tenders.map((tender: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <div className={`w-2 h-2 rounded-full ${
                                  tender.status === "working" ? "bg-green-500" : "bg-yellow-500"
                                }`} />
                                <span>{tender.name} - {tender.daysLeft} days left</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {message.data.type === "upcoming_deadlines" && (
                          <div className="space-y-2">
                            {message.data.tenders.map((tender: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <AlertCircle className="w-3 h-3 text-orange-500" />
                                <span>{tender.name} - {tender.daysLeft} days ({tender.priority} priority)</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Queries */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(query)}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your tenders..."
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Tenders</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Win Rate</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">67%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Due This Week</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Team Members</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
