"use client";

import { useState } from "react";
import { Search, HelpCircle, BookOpen, MessageCircle, Mail, Phone, ChevronRight, ChevronDown } from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("faq");

  const faqs = [
    {
      question: "How do I create a new tender project?",
      answer: "To create a new tender project, go to the Projects page and click the 'New Project' button. Fill in the tender details including title, description, deadline, and budget. You can also upload relevant documents during project creation."
    },
    {
      question: "How does the AI document analysis work?",
      answer: "Our AI analyzes uploaded documents to extract key information like tender requirements, deadlines, budget, and technical specifications. It also provides gap analysis against your company's capabilities and suggests improvements."
    },
    {
      question: "Can I collaborate with team members on tenders?",
      answer: "Yes! You can assign team members to tender projects, share documents, and collaborate in real-time. Use the team management features to assign roles and track progress."
    },
    {
      question: "How do I track tender deadlines?",
      answer: "The dashboard shows upcoming deadlines, and you'll receive notifications based on your preferences. You can also view detailed timelines in each project's workspace."
    },
    {
      question: "What file formats are supported for document upload?",
      answer: "We support PDF, DOCX, XLSX, and TXT files. The AI can analyze both text-based and scanned PDF documents to extract relevant information."
    },
    {
      question: "How do I export my data?",
      answer: "Go to Settings > Data & Backup and click 'Export Data'. You can export your projects, documents, and analytics in various formats including PDF reports and Excel spreadsheets."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use enterprise-grade security measures including encryption, secure data centers, and regular security audits. Your data is never shared with third parties without your explicit consent."
    },
    {
      question: "How do I integrate with external services?",
      answer: "Visit the Integrations page to connect with Google Drive, Gmail, Slack, Jira, OneDrive, and Outlook. These integrations help streamline your workflow and keep all your data synchronized."
    }
  ];

  const tutorials = [
    {
      title: "Getting Started with Syntara Tenders AI",
      description: "Learn the basics of creating and managing tender projects",
      duration: "5 min",
      category: "Basics"
    },
    {
      title: "AI Document Analysis Guide",
      description: "Master the AI-powered document analysis features",
      duration: "8 min",
      category: "AI Features"
    },
    {
      title: "Team Collaboration Best Practices",
      description: "Learn how to effectively collaborate with your team",
      duration: "6 min",
      category: "Collaboration"
    },
    {
      title: "Advanced Analytics and Reporting",
      description: "Unlock insights from your tender data",
      duration: "10 min",
      category: "Analytics"
    },
    {
      title: "Integration Setup Guide",
      description: "Connect external services to streamline your workflow",
      duration: "7 min",
      category: "Integrations"
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      action: "support@syntara.com",
      color: "bg-blue-600"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak with our support team",
      action: "+1 (555) 123-4567",
      color: "bg-green-600"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us in real-time",
      action: "Start Chat",
      color: "bg-purple-600"
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Help & Support
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Find answers, tutorials, and get support for Syntara Tenders AI
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {[
              { id: "faq", label: "FAQ", icon: HelpCircle },
              { id: "tutorials", label: "Tutorials", icon: BookOpen },
              { id: "contact", label: "Contact", icon: MessageCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {faq.question}
                    </span>
                    {expandedFaq === index ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-slate-600 dark:text-slate-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tutorials Tab */}
        {activeTab === "tutorials" && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
              Video Tutorials & Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial, index) => (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded">
                      {tutorial.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {tutorial.duration}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {tutorial.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {tutorial.description}
                  </p>
                  <button className="mt-3 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                    Watch Tutorial →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                Contact Support
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={index}
                      className="text-center p-6 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {method.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {method.description}
                      </p>
                      <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                        {method.action}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Submit a Support Ticket
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Priority
                  </label>
                  <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    placeholder="Please provide detailed information about your issue..."
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Ticket
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
