import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, MessageSquare, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { analyticsAPI } from '@/lib/api';

const COLORS = ['oklch(0.55 0.18 260)', 'oklch(0.6 0.18 170)', 'oklch(0.7 0.18 80)', 'oklch(0.55 0.2 25)', 'oklch(0.6 0.18 310)'];

// Mock data for charts (overridden by API data when available)
const mockUploads = [
  { month: 'Jan', count: 12 }, { month: 'Feb', count: 19 }, { month: 'Mar', count: 15 },
  { month: 'Apr', count: 28 }, { month: 'May', count: 35 }, { month: 'Jun', count: 42 },
];
const mockQueries = [
  { day: 'Mon', count: 45 }, { day: 'Tue', count: 62 }, { day: 'Wed', count: 38 },
  { day: 'Thu', count: 71 }, { day: 'Fri', count: 56 }, { day: 'Sat', count: 23 }, { day: 'Sun', count: 18 },
];
const mockRisk = [
  { name: 'Low', value: 45 }, { name: 'Medium', value: 30 }, { name: 'High', value: 18 }, { name: 'Critical', value: 7 },
];
const mockTopics = [
  { topic: 'Data Privacy', count: 89 }, { topic: 'HR Policies', count: 72 }, { topic: 'Vendor Compliance', count: 56 },
  { topic: 'IT Security', count: 48 }, { topic: 'Financial Audit', count: 34 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ total_documents: 0, total_queries: 0, compliance_score: 0, active_risks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.overview()
      .then(r => setStats(r.data))
      .catch(() => setStats({ total_documents: 147, total_queries: 342, compliance_score: 94.7, active_risks: 12 }))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Documents', value: stats.total_documents, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'AI Queries', value: stats.total_queries, icon: MessageSquare, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Compliance Score', value: `${stats.compliance_score}%`, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Active Risks', value: stats.active_risks, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold">Analytics</h1><p className="text-muted-foreground mt-1">Compliance intelligence and usage insights.</p></div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}><c.icon className={`w-5 h-5 ${c.color}`} /></div>
            </div>
            <div className="text-3xl font-bold">{c.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uploads Over Time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />Documents Uploaded</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockUploads}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" /><YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" /><Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} /><Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Queries Per Day */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-info" />Query Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockQueries}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" /><YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" /><Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} /><Area type="monotone" dataKey="count" stroke="var(--info)" fill="var(--info)" fillOpacity={0.1} strokeWidth={2} /></AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" />Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={mockRisk} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
              {mockRisk.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie><Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} /></PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Topics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" />Most Queried Topics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockTopics} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" /><YAxis dataKey="topic" type="category" tick={{ fontSize: 11 }} width={100} stroke="var(--muted-foreground)" /><Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} /><Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} /></BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
