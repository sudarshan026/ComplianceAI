import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, File, Trash2, CheckCircle2, Clock, XCircle, AlertCircle, X } from 'lucide-react';
import { documentsAPI } from '@/lib/api';

interface Doc {
  id: string; filename: string; file_type: string; status: string; uploaded_at: string; size: number;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocs = async () => {
    try { const res = await documentsAPI.list(); setDocs(res.data.documents || []); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchDocs(); }, []);

  const onDrop = useCallback(async (files: File[]) => {
    const valid = files.filter(f => ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'].includes(f.type) || f.name.match(/\.(pdf|docx|txt)$/i));
    if (valid.length === 0) { setError('Please upload PDF, DOCX, or TXT files only.'); return; }
    setError(''); setUploading(true); setProgress(0);
    try {
      await documentsAPI.upload(valid, setProgress);
      await fetchDocs();
    } catch (e: any) { setError(e.response?.data?.detail || 'Upload failed.'); } finally { setUploading(false); setProgress(0); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }, multiple: true });

  const handleDelete = async (id: string) => {
    try { await documentsAPI.delete(id); setDocs(d => d.filter(x => x.id !== id)); } catch {}
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { icon: any; label: string; cls: string }> = {
      indexed: { icon: CheckCircle2, label: 'Indexed', cls: 'bg-success/10 text-success' },
      processing: { icon: Clock, label: 'Processing', cls: 'bg-warning/10 text-warning' },
      error: { icon: XCircle, label: 'Error', cls: 'bg-destructive/10 text-destructive' },
    };
    const info = map[s] || { icon: AlertCircle, label: s, cls: 'bg-muted text-muted-foreground' };
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${info.cls}`}><info.icon className="w-3 h-3" />{info.label}</span>;
  };

  const typeIcon = (t: string) => {
    if (t === 'pdf') return <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><FileText className="w-5 h-5 text-destructive" /></div>;
    if (t === 'docx') return <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center"><File className="w-5 h-5 text-info" /></div>;
    return <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><FileText className="w-5 h-5 text-muted-foreground" /></div>;
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold">Documents</h1><p className="text-muted-foreground mt-1">Upload and manage your compliance documents.</p></div>

      {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}<button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button></div>}

      {/* Upload Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...getRootProps()}
        className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-muted/50'}`}>
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Upload className={`w-8 h-8 text-primary ${uploading ? 'animate-bounce' : ''}`} />
        </div>
        {uploading ? (
          <div>
            <p className="font-medium mb-2">Uploading... {progress}%</p>
            <div className="w-64 mx-auto h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        ) : (
          <div>
            <p className="font-medium mb-1">{isDragActive ? 'Drop files here' : 'Drag & drop files here'}</p>
            <p className="text-sm text-muted-foreground">or click to browse. Supports PDF, DOCX, TXT (max 50MB)</p>
          </div>
        )}
      </motion.div>

      {/* Document List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Uploaded Documents ({docs.length})</h2>
        {docs.length > 0 ? (
          <div className="space-y-3">
            {docs.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                {typeIcon(doc.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.filename}</p>
                  <p className="text-xs text-muted-foreground">{doc.file_type.toUpperCase()} · {(doc.size / 1024).toFixed(1)} KB · {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                </div>
                {statusBadge(doc.status)}
                <button onClick={() => handleDelete(doc.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No documents uploaded yet. Upload your first document above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
