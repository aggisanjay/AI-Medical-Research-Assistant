import { useState } from "react";
import { 
  Key, Database, Shield, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsView() {
  const [apiKey, setApiKey] = useState("sk-curalink-••••••••••••••••••••");
  const [complianceChecked, setComplianceChecked] = useState(true);
  const [dbTimeout, setDbTimeout] = useState(30);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="view-stagger space-y-8 pb-16">
      
      {/* Header */}
      <div className="border-b border-white/8 pb-6">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-white">
          System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-normal mt-1">
          Manage clinical compliance, database API connections, and hospital-wide configurations.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        
        {/* Compliance Card */}
        <div className="editorial-card p-6 border border-white/8 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/8 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-white">Clinical Compliance</h3>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">HIPAA and patient confidentiality constraints</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/8">
              <div>
                <div className="text-xs font-medium text-white">Patient Identifier Redaction</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-normal">Automatically strip names, dates, and locations from raw logs</div>
              </div>
              <input 
                type="checkbox" 
                checked={complianceChecked} 
                onChange={(e) => setComplianceChecked(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black text-[#2563EB] focus:ring-0 cursor-pointer" 
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/8">
              <div>
                <div className="text-xs font-medium text-white">Encrypted Export Pipeline</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-normal">All PDFs generated include a corporate audit stamp & signature block</div>
              </div>
              <input 
                type="checkbox" 
                defaultChecked 
                className="h-4 w-4 rounded border-white/20 bg-black text-[#2563EB] focus:ring-0 cursor-pointer" 
              />
            </div>
          </div>
        </div>

        {/* Database Toggle Parameters */}
        <div className="editorial-card p-6 border border-white/8 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/8 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-white">Database Endpoints</h3>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">Configure remote clinical integrations</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-normal">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-medium ml-1">PubMed API Throttle Rate</label>
                <input 
                  type="text" 
                  defaultValue="10 requests / sec" 
                  className="w-full bg-black/60 border border-white/8 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-medium ml-1">Max Search Timeout (Sec)</label>
                <input 
                  type="number" 
                  value={dbTimeout} 
                  onChange={(e) => setDbTimeout(parseInt(e.target.value))}
                  className="w-full bg-black/60 border border-white/8 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* API keys */}
        <div className="editorial-card p-6 border border-white/8 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/8 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-white">API Credentials</h3>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">Manage secure tokens for LLM generation</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-medium ml-1">Curalink LLM Token</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-black/60 border border-white/8 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/20 font-mono"
              />
              <Button size="default" onClick={handleSave}>
                {saved ? <Check className="h-3.5 w-3.5" /> : "Save"}
              </Button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
