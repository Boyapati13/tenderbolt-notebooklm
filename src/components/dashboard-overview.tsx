import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Target, Clock } from "lucide-react";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 700 },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6 p-6">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total Projects</div>
          <div className="stat-card__value">48</div>
          <div className="stat-card__trend trend-up">
            <TrendingUp size={16} />
            +12.5%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Active Team Members</div>
          <div className="stat-card__value">24</div>
          <div className="stat-card__trend trend-up">
            <Users size={16} />
            +3 this month
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Project Completion Rate</div>
          <div className="stat-card__value">92%</div>
          <div className="stat-card__trend trend-up">
            <Target size={16} />
            +5.2%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Average Time to Complete</div>
          <div className="stat-card__value">14.2d</div>
          <div className="stat-card__trend trend-down">
            <Clock size={16} />
            -2.1 days
          </div>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Project Performance</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary-600)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}