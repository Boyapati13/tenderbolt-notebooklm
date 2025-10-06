"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut, Scatter } from "react-chartjs-2";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Clock, 
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type AnalyticsData = {
  winRate: number;
  totalValue: number;
  avgROI: number;
  avgSubmissionTime: number;
  activeTenders: number;
  completedTenders: number;
  monthlyTrends: { [key: string]: { tenders: number; value: number; wins: number } };
  stageDistribution: { [key: string]: number };
  riskDistribution: { [key: string]: number };
  complianceDistribution: { [key: string]: number };
  teamPerformance: { [key: string]: { projects: number; wins: number; totalValue: number } };
};

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState("6months");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tenders/analytics?timeframe=${timeframe}`);
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <TrendingUp size={32} className="text-slate-600 dark:text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No analytics data available</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">Analytics will appear once you have tender data.</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const monthlyData = Object.entries(analyticsData.monthlyTrends || {}).map(([month, data]) => ({
    month,
    ...data
  }));

  const winRateData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: "Win Rate %",
        data: monthlyData.map(d => d.tenders > 0 ? (d.wins / d.tenders) * 100 : 0),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const valueTrendData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: "Total Value ($M)",
        data: monthlyData.map(d => d.value / 1000000),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  const stageDistributionData = {
    labels: Object.keys(analyticsData.stageDistribution || {}),
    datasets: [
      {
        data: Object.values(analyticsData.stageDistribution || {}),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(34, 197, 94)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)",
          "rgb(139, 92, 246)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const riskDistributionData = {
    labels: Object.keys(analyticsData.riskDistribution || {}),
    datasets: [
      {
        data: Object.values(analyticsData.riskDistribution || {}),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Advanced Analytics</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="text-slate-600 dark:text-slate-300" size={20} />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Win Rate</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{(analyticsData.winRate || 0).toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 text-sm font-medium">+5.2%</span>
            <span className="text-slate-600 dark:text-slate-300 text-sm ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Value</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">${((analyticsData.totalValue || 0) / 1000000).toFixed(1)}M</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 text-sm font-medium">+12.3%</span>
            <span className="text-slate-600 dark:text-slate-300 text-sm ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Average ROI</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{(analyticsData.avgROI || 0).toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 text-sm font-medium">+2.1%</span>
            <span className="text-slate-600 dark:text-slate-300 text-sm ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Submission Time</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{(analyticsData.avgSubmissionTime || 0).toFixed(1)} days</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 text-sm font-medium">-3.2 days</span>
            <span className="text-slate-600 dark:text-slate-300 text-sm ml-1">from last period</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Win Rate Trend</h3>
          <div className="h-64">
            <Line data={winRateData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Value Trend</h3>
          <div className="h-64">
            <Bar data={valueTrendData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Stage Distribution</h3>
          <div className="h-64">
            <Doughnut data={stageDistributionData} options={doughnutOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Risk Distribution</h3>
          <div className="h-64">
            <Doughnut data={riskDistributionData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Tenders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analyticsData.activeTenders || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Completed Tenders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analyticsData.completedTenders || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{(analyticsData.activeTenders || 0) + (analyticsData.completedTenders || 0)}</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Team Performance */}
      {analyticsData.teamPerformance && Object.keys(analyticsData.teamPerformance).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Team Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analyticsData.teamPerformance)
              .sort((a, b) => b[1].projects - a[1].projects)
              .map(([name, data]) => {
                const winRate = data.projects > 0 ? ((data.wins / data.projects) * 100).toFixed(1) : '0';
                return (
                  <div key={name} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-100 hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
                        {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{name}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{data.projects} projects</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Win Rate</span>
                        <span className={`font-semibold ${
                          parseFloat(winRate) >= 70 ? 'text-green-600' :
                          parseFloat(winRate) >= 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {winRate}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Wins</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{data.wins}/{data.projects}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Total Value</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          ${(data.totalValue / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
