import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { FileUp, ListRestart, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractTextFromPDF } from '../lib/pdf';
import { analyzeScientificPaper, ScientificAnalysis } from '../lib/gemini';
import { AuditReport } from './AuditReport';
import { cn } from '../lib/utils';

interface Audit {
  id: string;
  title: string;
  paperContent: string;
  analysis: ScientificAnalysis;
  createdAt: any;
  userId: string;
}

export function Dashboard({ userId }: { userId: string }) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'audits'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Audit));
      setAudits(docs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("Failed to fetch audits. Check Firestore rules.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      let content = "";
      if (file.type === "application/pdf") {
        content = await extractTextFromPDF(file);
      } else {
        content = await file.text();
      }

      if (content.length < 100) {
        throw new Error("The file content is too short for a scientific paper.");
      }

      const analysis = await analyzeScientificPaper(content);
      
      const docRef = await addDoc(collection(db, 'audits'), {
        title: file.name.replace(/\.[^/.]+$/, ""),
        paperContent: content.substring(0, 100000), // Safety cap
        analysis,
        userId,
        createdAt: serverTimestamp()
      });

      setSelectedAuditId(docRef.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this audit?")) return;
    try {
      await deleteDoc(doc(db, 'audits', id));
      if (selectedAuditId === id) setSelectedAuditId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete audit.");
    }
  };

  const selectedAudit = audits.find(a => a.id === selectedAuditId);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 gap-6" id="dashboard-container">
      {/* Sidebar: Controls & Audit List */}
      <aside className="w-full md:w-80 flex flex-col gap-6" id="dashboard-sidebar">
        {/* Upload Card */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-5">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 block">Initialization</label>
          <label className={cn(
            "relative flex items-center justify-center gap-3 w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-lg cursor-pointer hover:bg-slate-200 transition-all",
            analyzing && "opacity-50 pointer-events-none"
          )} id="upload-label">
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>New Paper</span>
              </>
            )}
            <input 
              type="file" 
              accept=".pdf,.txt" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={analyzing} 
              id="file-input"
            />
          </label>
          {analyzing && (
            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="bg-accent-blue h-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </div>
          )}
        </div>

        {/* Audit List Section */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Verification Journal</h3>
            <span className="text-[9px] font-mono text-slate-500">v3.1.2</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse border border-white/5" id={`skeleton-${i}`}></div>
              ))
            ) : audits.length === 0 ? (
              <div className="py-12 px-4 text-center" id="empty-state">
                <FileUp className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-[10px] uppercase tracking-widest text-slate-500 leading-relaxed">Queue Empty.<br/>Upload to process.</p>
              </div>
            ) : (
              audits.map((audit) => (
                <motion.div
                  layoutId={audit.id}
                  key={audit.id}
                  onClick={() => setSelectedAuditId(audit.id)}
                  className={cn(
                    "group relative p-4 rounded border transition-all cursor-pointer",
                    selectedAuditId === audit.id 
                      ? "bg-accent-blue/10 border-accent-blue/50" 
                      : "bg-white/[0.03] border-white/5 hover:border-white/20"
                  )}
                  id={`audit-card-${audit.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={cn(
                      "text-xs font-medium line-clamp-1 pr-6",
                      selectedAuditId === audit.id ? "text-white" : "text-slate-300"
                    )}>{audit.title}</h4>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        audit.analysis.authenticity.score > 80 ? "bg-green-500" : audit.analysis.authenticity.score > 50 ? "bg-yellow-500" : "bg-red-500"
                      )}></div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        Score {audit.analysis.authenticity.score}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(audit.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-red-400"
                      id={`delete-btn-${audit.id}`}
                    >
                      <ListRestart className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Neural Feed</h4>
            <div className="text-[9px] font-mono text-slate-500 space-y-1">
              <p className="text-slate-600 italic">&gt; system.init()</p>
              <p className="text-slate-600 italic">&gt; clusters_active: true</p>
              <p className={cn(analyzing ? "text-accent-blue font-bold animate-pulse" : "text-green-900")}>
                &gt; {analyzing ? "auditing_derivatives..." : "vessel_stable."}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main View: Report Container */}
      <div className="flex-1 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col relative" id="report-view">
        <div className="h-12 bg-slate-100 border-b border-slate-200 flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
          </div>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            {selectedAuditId ? `ANALYSIS LOG: ${selectedAuditId.substring(0, 8)}` : "STANDBY MODE"}
          </span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {selectedAudit ? (
              <AuditReport key={selectedAudit.id} audit={selectedAudit} />
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center"
                id="no-selection-view"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                  <FileUp className="w-8 h-8 opacity-20 text-slate-900" />
                </div>
                <h4 className="text-xl font-medium text-slate-800 mb-3">Analysis Interface Stable</h4>
                <p className="max-w-xs text-sm leading-relaxed text-slate-500">
                  Select a paper from your verification journal to inspect neural findings, mathematical derivation checks, and integrity logs.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 left-6 right-6 bg-red-600 text-white p-4 rounded-lg flex items-center gap-3 shadow-2xl z-50 overflow-hidden"
            id="error-banner"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
            <motion.div className="absolute left-0 bottom-0 h-1 bg-black/20 w-full" initial={{ width: '100%' }} animate={{ width: 0 }} transition={{ duration: 5 }} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ score, label }: { score: number, label: string }) {
  const color = score > 80 ? 'text-green-600' : score > 50 ? 'text-amber-600' : 'text-red-600';
  const bgColor = score > 80 ? 'bg-green-50' : score > 50 ? 'bg-amber-50' : 'bg-red-50';
  
  return (
    <div className={cn("flex flex-col items-center gap-0.5")}>
      <div className={cn("w-10 h-10 flex items-center justify-center rounded-full border-2 border-neutral-100 font-mono text-xs font-bold", color, bgColor)} id={`score-ring-${label}`}>
        {score}%
      </div>
      <span className="text-[9px] font-bold uppercase tracking-tighter text-neutral-400">{label}</span>
    </div>
  );
}
