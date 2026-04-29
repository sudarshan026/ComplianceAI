import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, FileText, Plus, Loader2, Copy, Check, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatAPI } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { document: string; page?: number }[];
  timestamp: Date;
}

interface Conversation { id: string; title: string; updated_at: string; }

const prompts = [
  'What are the key compliance requirements?',
  'Summarize the data privacy policy',
  'Identify risks in the employee handbook',
  'What clauses relate to vendor agreements?',
  'Generate an executive summary of policies',
  'What audit observations should I know?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [convId, setConvId] = useState<string | undefined>();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatAPI.conversations().then(r => setConvs(r.data.conversations || [])).catch(() => {}); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setMessages(p => [...p, { id: Date.now().toString(), role: 'user', content: q, timestamp: new Date() }]);
    setInput(''); setLoading(true);
    try {
      const res = await chatAPI.query(q, convId);
      setConvId(res.data.conversation_id);
      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', content: res.data.answer, sources: res.data.sources, timestamp: new Date() }]);
    } catch {
      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', content: 'Error processing request. Please ensure documents are uploaded and backend is running.', timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  const copy = (id: string, c: string) => { navigator.clipboard.writeText(c); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  return (
    <div className="flex h-[calc(100vh-7rem)] -m-6">
      {/* Sidebar */}
      <div className="w-72 border-r border-border bg-card flex-col shrink-0 hidden lg:flex">
        <div className="p-4 border-b border-border">
          <button onClick={() => { setMessages([]); setConvId(undefined); }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {convs.map(c => (
            <button key={c.id} onClick={async () => { try { const r = await chatAPI.messages(c.id); setConvId(c.id); setMessages((r.data.messages||[]).map((m:any,i:number) => ({ id:`${c.id}-${i}`, role:m.role, content:m.content, sources:m.sources, timestamp:new Date(m.timestamp) }))); } catch{} }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm truncate ${convId===c.id?'bg-accent text-accent-foreground':'text-muted-foreground hover:bg-muted'}`}>
              <MessageSquare className="w-3.5 h-3.5 inline-block mr-2" />{c.title}
            </button>
          ))}
          {convs.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><Sparkles className="w-8 h-8 text-primary" /></div>
              <h2 className="text-2xl font-bold mb-2">ComplianceAI Assistant</h2>
              <p className="text-muted-foreground mb-8 text-center max-w-md">Ask questions about your uploaded compliance documents.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                {prompts.map(p => <button key={p} onClick={() => send(p)} className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/30 text-sm text-muted-foreground hover:text-foreground transition-all">{p}</button>)}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className={`flex gap-3 ${msg.role==='user'?'justify-end':''}`}>
                    {msg.role==='assistant' && <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1"><Bot className="w-4 h-4 text-primary" /></div>}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role==='user'?'bg-primary text-primary-foreground':'bg-card border border-border'}`}>
                      {msg.role==='assistant' ? <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div> : <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Sources:</p>
                          <div className="flex flex-wrap gap-2">{msg.sources.map((s,i) => <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground"><FileText className="w-3 h-3" />{s.document}{s.page && ` (p.${s.page})`}</span>)}</div>
                        </div>
                      )}
                      {msg.role==='assistant' && <div className="mt-2 flex justify-end"><button onClick={() => copy(msg.id, msg.content)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">{copiedId===msg.id?<Check className="w-3 h-3"/>:<Copy className="w-3 h-3"/>}{copiedId===msg.id?'Copied':'Copy'}</button></div>}
                    </div>
                    {msg.role==='user' && <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-1"><User className="w-4 h-4 text-primary-foreground" /></div>}
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div><div className="rounded-2xl px-4 py-3 bg-card border border-border"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Analyzing documents...</div></div></motion.div>}
              <div ref={endRef} />
            </div>
          )}
        </div>
        {/* Input */}
        <div className="border-t border-border bg-background p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 rounded-2xl border border-border bg-card p-3 focus-within:border-primary/50 transition-all">
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask about your compliance documents..." rows={1} className="flex-1 bg-transparent text-sm resize-none focus:outline-none min-h-[24px] max-h-[120px] py-1" onInput={e => { const t=e.target as HTMLTextAreaElement; t.style.height='auto'; t.style.height=t.scrollHeight+'px'; }} />
              <button onClick={() => send()} disabled={!input.trim()||loading} className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-30 shrink-0"><Send className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">ComplianceAI uses RAG to answer from your uploaded documents.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
