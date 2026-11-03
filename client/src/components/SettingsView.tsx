import { useState } from "react";
import { useUser } from "@clerk/react";
import { AlertTriangle, FileText, Gauge, Lock, ServerCog, ShieldCheck, Sparkles } from "lucide-react";
import { PageHead, Panel, PanelTitle } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

type Mode = "standard" | "executive" | "document";
const MODES: { id: Mode; title: string; body: string; icon: typeof FileText }[] = [
  { id: "standard", title: "Full report", body: "A complete written report with sources, evidence tables and trial matches.", icon: FileText },
  { id: "executive", title: "Briefing", body: "Key findings, risks, opportunities and recommended actions on one page.", icon: Gauge },
  { id: "document", title: "My documents", body: "Answers drawn only from documents you select in the workspace.", icon: Sparkles },
];

const SAFEGUARDS = [
  ["Prompt-injection scanning", "Requests are checked for instruction-override patterns before they reach a model."],
  ["PII and PHI redaction", "Common identifiers such as SSNs, MRNs, emails, phone numbers and dates of birth are masked in requests."],
  ["Citation verification", "PMIDs, trial IDs and citations in a draft are checked against what was retrieved."],
];

export function SettingsView() {
  const { user } = useUser();
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem("curalink_response_mode") as Mode) || "standard");
  const choose = (m: Mode) => {
    setMode(m);
    localStorage.setItem("curalink_response_mode", m);
  };
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="view-stagger space-y-5 pb-12">
      <PageHead title="Settings" description="Your account, how answers are formatted, and what protects your data." />

      <Panel>
        <PanelTitle title="Account" hint="Managed through your sign-in provider. Use the avatar in the top bar to edit it." />
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="text-[12px] text-white/45">Name</dt><dd className="mt-0.5 text-[14px] text-white">{user?.fullName || "Not set"}</dd></div>
          <div><dt className="text-[12px] text-white/45">Email</dt><dd className="mt-0.5 break-all text-[14px] text-white">{email || "Not available"}</dd></div>
        </dl>
      </Panel>

      <Panel>
        <PanelTitle title="Default answer format" hint="Saved on this device. You can change it per question in the workspace." />
        <div role="radiogroup" aria-label="Default answer format" className="grid gap-3 md:grid-cols-3">
          {MODES.map(({ id, title, body, icon: Icon }) => {
            const on = mode === id;
            return (
              <button key={id} role="radio" aria-checked={on} onClick={() => choose(id)} className={cn("rounded-xl border p-3.5 sm:p-4 text-left transition-all duration-200", on ? "border-sky-300/60 bg-sky-300/[0.08] shadow-[0_0_0_1px_rgba(125,211,252,0.25)]" : "border-white/10 bg-white/[0.02] hover:border-white/25")}>
                <span className={cn("mb-3 grid h-8 w-8 place-items-center rounded-lg", on ? "bg-sky-300/20 text-sky-200" : "bg-white/[0.06] text-white/55")}><Icon className="h-4 w-4" /></span>
                <span className="block text-[14px] font-medium text-white">{title}</span>
                <span className="mt-1 block text-[12.5px] leading-relaxed text-white/55">{body}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <PanelTitle title="Safeguards" hint="Enforced by the server on every request. These are not toggles." right={<Lock className="h-4 w-4 text-white/30" />} />
        <ul className="grid gap-3 md:grid-cols-3">
          {SAFEGUARDS.map(([t, b]) => (
            <li key={t} className="rounded-xl border border-white/10 bg-black/20 p-3.5 sm:p-4">
              <ShieldCheck className="mb-2.5 h-4 w-4 text-emerald-300" />
              <p className="text-[13.5px] font-medium text-white">{t}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/50">{b}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-white/40">Pattern-based checks are a first line of defence, not a guarantee.</p>
      </Panel>

      <Panel>
        <PanelTitle title="Server configuration" hint="Model providers, keys and limits live on the server, not in the browser." right={<ServerCog className="h-4 w-4 text-white/30" />} />
        <p className="text-[13px] leading-relaxed text-white/65">
          Set <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-white">LLM_PROVIDER</code> (ollama or huggingface), the matching model variables, and{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-white">EMBEDDING_PROVIDER</code> in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-white">server/.env</code>, then restart the API. API keys are never shown or stored in this app.
        </p>
      </Panel>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-300/[0.05] px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p className="text-[12.5px] leading-relaxed text-amber-100/85">CuraLink is a research aid for investigators. It does not provide medical advice, diagnosis or treatment, and does not replace clinical judgement.</p>
      </div>
    </div>
  );
}
