import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, FileText, Filter, X } from 'lucide-react';
import { searchAPI } from '@/lib/api';

interface SearchResult { document: string; chunk: string; score: number; page?: number; file_type: string; }

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filterType, setFilterType] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const res = await searchAPI.search(query, { type: filterType || undefined });
      setResults(res.data.results || []);
    } catch { setResults([]); } finally { setLoading(false); }
  };

  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((p, i) => p.toLowerCase() === query.toLowerCase() ? <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{p}</mark> : p);
  };

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold">Search</h1><p className="text-muted-foreground mt-1">Search across all your compliance documents using AI-powered semantic search.</p></div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 focus-within:border-primary/50 transition-all">
          <SearchIcon className="w-5 h-5 text-muted-foreground shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search policies, clauses, compliance requirements..." className="flex-1 bg-transparent text-sm focus:outline-none" />
          {query && <button type="button" onClick={() => { setQuery(''); setResults([]); setSearched(false); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary/50">
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="txt">TXT</option>
        </select>
        <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Results */}
      {loading && <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search term or upload more documents.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{results.length} results found</p>
          {results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{r.document}</p>
                  <p className="text-xs text-muted-foreground">{r.file_type.toUpperCase()}{r.page && ` · Page ${r.page}`} · Relevance: {(r.score * 100).toFixed(0)}%</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{highlight(r.chunk)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {!searched && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"><SearchIcon className="w-10 h-10 text-primary" /></div>
          <h2 className="text-xl font-bold mb-2">Semantic Document Search</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Search across all your uploaded documents using natural language. Our AI understands context and meaning, not just keywords.</p>
        </div>
      )}
    </div>
  );
}
