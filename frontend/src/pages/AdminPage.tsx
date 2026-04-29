import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, FileText, MessageSquare, Activity } from 'lucide-react';
import { adminAPI } from '@/lib/api';

interface UserInfo { id: string; name: string; email: string; role: string; created_at: string; }
interface LogEntry { id: string; user: string; query: string; timestamp: string; }
interface IndexStatus { document: string; status: string; chunks: number; }

export default function AdminPage() {
  const [tab, setTab] = useState<'users'|'logs'|'indexing'>('users');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [indexing, setIndexing] = useState<IndexStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetch = tab === 'users' ? adminAPI.users().then(r => setUsers(r.data.users || []))
      : tab === 'logs' ? adminAPI.logs().then(r => setLogs(r.data.logs || []))
      : adminAPI.indexing().then(r => setIndexing(r.data.documents || []));
    fetch.catch(() => {}).finally(() => setLoading(false));
  }, [tab]);

  const tabs = [
    { key: 'users' as const, label: 'Users', icon: Users },
    { key: 'logs' as const, label: 'Query Logs', icon: MessageSquare },
    { key: 'indexing' as const, label: 'Indexing Status', icon: Activity },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
        <div><h1 className="text-3xl font-bold">Admin Panel</h1><p className="text-muted-foreground">Manage users, monitor queries, and track indexing.</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-px">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>}

      {!loading && tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/50"><th className="text-left px-4 py-3 font-medium">Name</th><th className="text-left px-4 py-3 font-medium">Email</th><th className="text-left px-4 py-3 font-medium">Role</th><th className="text-left px-4 py-3 font-medium">Joined</th></tr></thead>
            <tbody className="divide-y divide-border">
              {users.length > 0 ? users.map(u => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td><td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role==='admin'?'bg-primary/10 text-primary':'bg-muted text-muted-foreground'}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              )) : <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>}
            </tbody>
          </table>
        </motion.div>
      )}

      {!loading && tab === 'logs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/50"><th className="text-left px-4 py-3 font-medium">User</th><th className="text-left px-4 py-3 font-medium">Query</th><th className="text-left px-4 py-3 font-medium">Time</th></tr></thead>
            <tbody className="divide-y divide-border">
              {logs.length > 0 ? logs.map(l => (
                <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{l.user}</td><td className="px-4 py-3 text-muted-foreground truncate max-w-md">{l.query}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                </tr>
              )) : <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No query logs yet</td></tr>}
            </tbody>
          </table>
        </motion.div>
      )}

      {!loading && tab === 'indexing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {indexing.length > 0 ? indexing.map((d, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1"><p className="font-medium text-sm">{d.document}</p><p className="text-xs text-muted-foreground">{d.chunks} chunks indexed</p></div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.status==='indexed'?'bg-success/10 text-success':'bg-warning/10 text-warning'}`}>{d.status}</span>
            </div>
          )) : <div className="text-center py-12 text-muted-foreground">No indexed documents</div>}
        </motion.div>
      )}
    </div>
  );
}
