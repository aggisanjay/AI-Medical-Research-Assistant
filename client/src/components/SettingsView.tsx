import { useState } from "react";
import { 
  Settings, Key, Database, Shield, Lock, 
  HelpCircle, CheckCircle, RefreshCw 
} from "lucide-react";

export function SettingsView() {
  const [apiKey, setApiKey] = useState("sk-curalink-••••••••••••••••••••");
  const [complianceChecked, setComplianceChecked] = useState(true);
  const [dbTimeout, setDbTimeout] = useState(30);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">
          System Settings
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Manage clinical compliance, database API connections, and hospital-wide configurations.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Compliance Card */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-display">Clinical Compliance</h3>
              <p className="text-[10px] text-slate-500 font-light mt-0.5">HIPAA and patient confidentiality constraints</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
              <div>
                <div className="text-xs font-semibold text-slate-200">Patient Identifier Redaction</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Automatically strip names, dates, and locations from raw logs</div>
              </div>
              <input 
                type="checkbox" 
                checked={complianceChecked} 
                onChange={(e) => setComplianceChecked(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20" 
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-900">
              <div>
                <div className="text-xs font-semibold text-slate-200">Encrypted Export Pipeline</div>
                <div className="text-[10px] text-slate-500 mt-0.5">All PDFs generated include a corporate audit stamp & signature block</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20" />
            </div>
          </div>
        </div>

        {/* Database Toggle Parameters */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-display">Database Endpoints</h3>
              <p className="text-[10px] text-slate-500 font-light mt-0.5">Configure remote clinical integrations</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-light">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider ml-1">PubMed API Throttle Rate</label>
                <input 
                  type="text" 
                  defaultValue="10 requests / sec" 
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-550 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider ml-1">Max Literature Search Timeout (Sec)</label>
                <input 
                  type="number" 
                  value={dbTimeout} 
                  onChange={(e) => setDbTimeout(parseInt(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-550 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* API keys */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-display">API Credentials</h3>
              <p className="text-[10px] text-slate-500 font-light mt-0.5">Manage secure tokens for LLM generation</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider ml-1">Curalink LLM Token</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-550 focus:outline-none"
              />
              <button className="flex items-center justify-center rounded-xl bg-slate-900 border border-slate-850 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-850 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
