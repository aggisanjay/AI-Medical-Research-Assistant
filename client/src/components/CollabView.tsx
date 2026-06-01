import { 
  Users, UserCheck, MessageSquare, Shield, Clock, 
  CheckSquare, ArrowUpRight, CheckCircle2 
} from "lucide-react";

export function CollabView() {
  const researchers = [
    { name: "Dr. Sarah Jenkins", role: "Principal Oncologist", status: "Active Now", color: "bg-emerald-500" },
    { name: "Dr. Marcus Chen", role: "Molecular Pathologist", status: "Active 5m ago", color: "bg-emerald-500/60" },
    { name: "Dr. Elena Rostova", role: "Clinical Trials Director", status: "Offline", color: "bg-slate-700" }
  ];

  const reviewQueue = [
    {
      caseId: "REF-30912",
      disease: "Stage IV Lung Adenocarcinoma",
      target: "EGFR L858R",
      reviewer: "Dr. Marcus Chen",
      status: "Awaiting Review",
      badgeColor: "text-amber-400 bg-amber-950/40 border-amber-900/30"
    },
    {
      caseId: "REF-48210",
      disease: "Relapsed Lymphoma",
      target: "CD19 CAR-T",
      reviewer: "Dr. Sarah Jenkins",
      status: "Approved",
      badgeColor: "text-emerald-400 bg-emerald-950/40 border-emerald-900/30"
    },
    {
      caseId: "REF-11029",
      disease: "HFpEF Heart Failure",
      target: "Empagliflozin SGLT2",
      reviewer: "Dr. Elena Rostova",
      status: "Approved",
      badgeColor: "text-emerald-400 bg-emerald-950/40 border-emerald-900/30"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          Team Collaboration
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Coordinate review workflows, discuss genetic targets, and authorize peer-reviewed research outputs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Active Sessions */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="glass-card p-5 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-display">
              <Users className="h-4 w-4 text-cyan-400" />
              Oncology Review Panel
            </h3>
            
            <div className="space-y-4">
              {researchers.map((res, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900/60">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-white">
                        {res.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-slate-950 ${res.color}`} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{res.name}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{res.role}</div>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-light">{res.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
              Panel Guidelines
            </h3>
            <div className="text-[11px] text-slate-400 font-light space-y-2 leading-relaxed">
              <p>
                1. Dual-signature requirements apply to all experimental TKI matching summaries exported for external board usage.
              </p>
              <p>
                2. Discrepancies in PubMed citation relevance rankings must be resolved with the clinical trials director prior to report archiving.
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Clinical Review Approval Queue */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
              Clinical Review Board Approvals Queue
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Pending: <strong className="text-amber-400">1 Case</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Case ID</th>
                  <th className="pb-3">Diagnosis</th>
                  <th className="pb-3">Target Assay</th>
                  <th className="pb-3">Assignee</th>
                  <th className="pb-3 text-right">Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {reviewQueue.map((item, i) => (
                  <tr key={i} className="hover:bg-white/20 transition-colors">
                    <td className="py-4 font-mono font-medium text-slate-200">{item.caseId}</td>
                    <td className="py-4 text-slate-300 font-light max-w-[150px] truncate">{item.disease}</td>
                    <td className="py-4 text-cyan-400 font-medium">{item.target}</td>
                    <td className="py-4 text-slate-400 font-light">{item.reviewer}</td>
                    <td className="py-4 text-right">
                      <span className={`inline-block text-[9px] px-2 py-0.5 rounded border ${item.badgeColor}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Discussion feed section */}
          <div className="border-t border-slate-900 pt-5 mt-5 space-y-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              Panel Activity Notes
            </div>
            
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900/80 text-xs font-light space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <strong className="text-slate-300 font-semibold">Dr. Marcus Chen</strong>
                  <span className="text-slate-500">2 hours ago</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  L858R mutation confirmed on pathology report for REF-30912. Recommending immediate approval of the osimertinib literature summary.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
