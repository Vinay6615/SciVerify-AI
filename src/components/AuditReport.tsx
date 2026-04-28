import { ScientificAnalysis } from '../lib/gemini';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Search, Lightbulb, FileText, Ban, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface AuditReportProps {
  audit: {
    title: string;
    analysis: ScientificAnalysis;
  };
}

export function AuditReport({ audit }: AuditReportProps) {
  const { analysis } = audit;

  const stats = [
    { label: 'Authenticity', value: analysis.authenticity.score, icon: BarChart3, color: 'accent-blue' },
    { label: 'Integrity', value: 100 - analysis.plagiarism.score, icon: Search, color: 'green-500' },
    { label: 'Objectivity', value: 100 - analysis.bias.score, icon: Ban, color: 'amber-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="p-10 h-full overflow-y-auto bg-white text-slate-800"
      id="audit-report-content"
    >
      <header className="mb-12" id="report-header">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 font-mono">Neural Inference Journal</span>
          <div className="h-px flex-1 bg-slate-100"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 font-mono">BARD-SCI v2.4</span>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-10 leading-none">{audit.title}</h1>
        
        <div className="flex flex-wrap gap-4" id="report-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="flex-1 min-w-[140px] p-6 bg-slate-50 rounded-lg border border-slate-100 relative overflow-hidden group">
              <div className={cn("absolute top-0 right-0 w-16 h-16 opacity-5 transition-transform group-hover:scale-110", `text-${stat.color}`)}>
                <stat.icon className="w-full h-full" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">{stat.label}</span>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-light italic tracking-tighter leading-none">{stat.value}</span>
                <span className="text-lg opacity-40 font-medium pb-1">/100</span>
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10" id="report-sections">
        {/* Left Column */}
        <div className="space-y-12">
          {/* Authenticity Section */}
          <section className="space-y-6" id="authenticity-section">
            <SectionHeader icon={CheckCircle2} title="Scientific Verification" />
            <div className="space-y-4">
              <div className="p-5 bg-white border border-slate-100 rounded-lg shadow-sm">
                <h4 className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" /> Engine Findings
                </h4>
                <ul className="space-y-3">
                  {analysis.authenticity.findings.map((f, i) => (
                    <li key={i} className="text-sm text-slate-600 leading-relaxed font-medium pl-4 border-l border-slate-200">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 bg-slate-900 text-white rounded-lg shadow-xl font-mono">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Derivation Triggers</h4>
                <div className="space-y-2">
                  {analysis.authenticity.derivationChecks.map((d, i) => (
                    <div key={i} className="text-[11px] leading-tight flex gap-3">
                      <span className="text-accent-blue text-bold">&gt;</span>
                      <span className="opacity-80">{d}</span>
                    </div>
                  ))}
                  <p className="text-accent-blue animate-pulse mt-4 text-[11px] font-bold tracking-widest uppercase">Verified Stable.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Suggestions Section */}
          <section className="space-y-6" id="suggestions-section">
            <SectionHeader icon={Lightbulb} title="Global Intelligence Feed" />
            <div className="space-y-3">
              {analysis.suggestions.map((s, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded flex gap-4 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-1.5 group-hover:scale-150 transition-transform" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Observation 0{i+1}</p>
                  <p className="text-[13px] text-slate-700 leading-tight flex-1">{s}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-12">
          {/* Faulty Regions Section */}
          {analysis.faultyRegions.length > 0 && (
            <section className="space-y-6" id="faulty-regions-section">
              <SectionHeader icon={AlertTriangle} title="Logical Discrepancies" />
              <div className="space-y-4">
                {analysis.faultyRegions.map((region, i) => (
                  <div key={i} className="bg-red-50/50 border border-red-100 rounded-lg overflow-hidden flex flex-col" id={`faulty-region-${i}`}>
                    <div className="px-4 py-3 bg-red-100/50 border-b border-red-100 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Error Trace {i + 1}</span>
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    </div>
                    <div className="p-5">
                      <p className="text-sm font-medium text-red-900 mb-4 bg-white/50 p-3 rounded border border-red-200/50 italic leading-relaxed">
                        "{region.text}"
                      </p>
                      <div className="text-[12px] text-red-700 leading-relaxed flex gap-3">
                        <span className="font-bold shrink-0 uppercase tracking-widest text-[10px] mt-0.5">Analysis:</span>
                        <span>{region.explanation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Integrity & Bias */}
          <section className="space-y-8" id="integrity-bias-section">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={Search} title="Plagiarism Index" />
                <span className={cn("text-xs font-mono font-bold", analysis.plagiarism.score > 30 ? 'text-red-500' : 'text-green-600')}>
                  {analysis.plagiarism.score}.0% Match
                </span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.plagiarism.score}%` }}
                  className={cn("h-full", analysis.plagiarism.score > 30 ? 'bg-red-500' : 'bg-green-500')} 
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {analysis.plagiarism.detectedSources.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={Ban} title="Statistical Skew" />
                <span className={cn("text-xs font-mono font-bold", analysis.bias.score > 30 ? 'text-amber-500' : 'text-green-600')}>
                  {analysis.bias.score}.0% Detection
                </span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.bias.score}%` }}
                  className={cn("h-full", analysis.bias.score > 30 ? 'bg-amber-500' : 'bg-green-500')} 
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {analysis.bias.types.map((t, i) => (
                  <span key={i} className="px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[9px] font-bold text-amber-700 uppercase tracking-tighter">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-20 border-t border-slate-100 pt-8 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
        <span>Verified by Gemini-Pro Neural Cluster</span>
        <span className="italic opacity-50">Reference: SCI-VER-028</span>
      </div>
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any, title: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-slate-900" />
      <h3 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-900">{title}</h3>
    </div>
  );
}
