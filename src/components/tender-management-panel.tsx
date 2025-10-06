"use client";

import { useEffect, useState } from "react";
import { Calendar, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign } from "lucide-react";

type Tender = {
  id: string;
  title: string;
  status: string;
  value?: number;
  deadline?: string;
  winProbability?: number;
  technicalScore?: number;
  commercialScore?: number;
  complianceScore?: number;
  riskScore?: number;
  stages?: Array<{
    id: string;
    name: string;
    status: string;
    dueDate?: string;
  }>;
};

type ScoringData = {
  technical: number;
  commercial: number;
  compliance: number;
  risk: number;
};

export function TenderManagementPanel() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [scoringData, setScoringData] = useState<ScoringData>({
    technical: 0,
    commercial: 0,
    compliance: 0,
    risk: 0,
  });
  const [isScoring, setIsScoring] = useState(false);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const response = await fetch("/api/tenders");
      const data = await response.json();
      setTenders(data.tenders || []);
      if (data.tenders?.length > 0) {
        setSelectedTender(data.tenders[0]);
        loadScoringData(data.tenders[0].id);
      }
    } catch (error) {
      console.error("Error fetching tenders:", error);
    }
  };

  const loadScoringData = async (tenderId: string) => {
    try {
      const response = await fetch(`/api/tenders/scoring?tenderId=${tenderId}`);
      const data = await response.json();
      if (data.success) {
        setScoringData({
          technical: data.scores.technical,
          commercial: data.scores.commercial,
          compliance: data.scores.compliance,
          risk: data.scores.risk,
        });
      }
    } catch (error) {
      console.error("Error loading scoring data:", error);
    }
  };

  const handleScoringChange = (field: keyof ScoringData, value: number) => {
    setScoringData(prev => ({ ...prev, [field]: value }));
  };

  const saveScoring = async () => {
    if (!selectedTender) return;
    
    setIsScoring(true);
    try {
      const response = await fetch("/api/tenders/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: selectedTender.id,
          scores: scoringData,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Update the tender in the list
        setTenders(prev => prev.map(t => 
          t.id === selectedTender.id 
            ? { ...t, winProbability: data.winProbability }
            : t
        ));
        setSelectedTender(prev => prev ? { ...prev, winProbability: data.winProbability } : null);
      }
    } catch (error) {
      console.error("Error saving scores:", error);
    } finally {
      setIsScoring(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "won": return "text-green-600 bg-green-100";
      case "lost": return "text-red-600 bg-red-100";
      case "active": return "text-blue-600 bg-blue-100";
      case "completed": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tender Management</h2>
        <button 
          onClick={fetchTenders}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Tender List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Active Tenders</h3>
        <div className="space-y-2 max-h-48 overflow-auto">
          {tenders.map((tender) => (
            <div
              key={tender.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedTender?.id === tender.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedTender(tender);
                loadScoringData(tender.id);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{tender.title}</div>
                  <div className="text-xs text-gray-500">
                    ${tender.value?.toLocaleString() || 'TBD'} • {tender.stages?.length || 0} stages
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tender.status)}`}>
                    {tender.status}
                  </span>
                  {tender.winProbability && (
                    <span className="text-xs font-medium">
                      {tender.winProbability}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Tender Details */}
      {selectedTender && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium mb-3">Tender Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-500" />
                <span className="text-gray-600">Value:</span>
                <span className="font-medium">${selectedTender.value?.toLocaleString() || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-gray-600">Deadline:</span>
                <span className="font-medium">{selectedTender.deadline || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-gray-500" />
                <span className="text-gray-600">Win Probability:</span>
                <span className={`font-medium ${getScoreColor(selectedTender.winProbability || 0)}`}>
                  {selectedTender.winProbability || 0}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <span className="text-gray-600">Stages:</span>
                <span className="font-medium">{selectedTender.stages?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Scoring Panel */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium mb-3">Scoring & Assessment</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Technical Score</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoringData.technical}
                    onChange={(e) => handleScoringChange('technical', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-center mt-1">{scoringData.technical}%</div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Commercial Score</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoringData.commercial}
                    onChange={(e) => handleScoringChange('commercial', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-center mt-1">{scoringData.commercial}%</div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Compliance Score</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoringData.compliance}
                    onChange={(e) => handleScoringChange('compliance', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-center mt-1">{scoringData.compliance}%</div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Risk Level</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoringData.risk}
                    onChange={(e) => handleScoringChange('risk', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-center mt-1">{scoringData.risk}%</div>
                </div>
              </div>
              <button
                onClick={saveScoring}
                disabled={isScoring}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isScoring ? "Saving..." : "Update Scoring"}
              </button>
            </div>
          </div>

          {/* Stages Timeline */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium mb-3">Project Stages</h3>
            <div className="space-y-2">
              {selectedTender.stages?.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-3 p-2 rounded border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{stage.name}</div>
                    <div className="text-xs text-gray-500">{stage.dueDate || 'No deadline set'}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(stage.status)}`}>
                    {stage.status}
                  </span>
                </div>
              )) || (
                <div className="text-sm text-gray-500 text-center py-4">
                  No stages defined yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
