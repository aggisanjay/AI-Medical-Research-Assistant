import { useState } from "react";
import { ArrowUp, ChevronDown, ChevronUp, FileText, MapPin, Stethoscope, User } from "lucide-react";
import type { DocumentSummary, SendMessagePayload } from "@/lib/api";
import { cn } from "@/lib/utils";
import { inputCls } from "@/components/ui/kit";

interface Props {
  onSubmit: (payload: SendMessagePayload) => void;
  disabled?: boolean;
  documents?: DocumentSummary[];
  selectedDocumentIds?: string[];
  onDocumentIdsChange?: (ids: string[]) => void;
}

export function StructuredInput({
  onSubmit,
  disabled,
  documents = [],
  selectedDocumentIds = [],
  onDocumentIdsChange,
}: Props) {
  const [mode, setMode] = useState<"natural" | "structured">("natural");
  const [message, setMessage] = useState("");
  const [patientName, setPatientName] = useState("");
  const [disease, setDisease] = useState("");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [responseMode, setResponseMode] = useState<"standard" | "executive" | "document">(
    () => (localStorage.getItem("curalink_response_mode") as "standard" | "executive" | "document") || "standard"
  );

  const readyDocs = documents.filter((d) => d.status === "ready");

  const toggleDocument = (documentId: string) => {
    if (!onDocumentIdsChange) return;
    if (selectedDocumentIds.includes(documentId)) {
      onDocumentIdsChange(selectedDocumentIds.filter((id) => id !== documentId));
    } else {
      onDocumentIdsChange([...selectedDocumentIds, documentId]);
    }
  };

  const docPayload = selectedDocumentIds.length > 0 ? { documentIds: selectedDocumentIds } : {};

  const submit = () => {
    if (disabled) return;
    if (responseMode === "document" && selectedDocumentIds.length === 0) return;
    if (mode === "structured") {
      if (!disease.trim() && !query.trim()) return;
      onSubmit({ isStructured: true, patientName, disease, query, location, responseMode, ...docPayload });
      setQuery("");
    } else {
      if (!message.trim()) return;
      onSubmit({
        message,
        patientName: advancedOpen ? patientName : undefined,
        disease: advancedOpen ? disease : undefined,
        location: advancedOpen ? location : undefined,
        responseMode,
        ...docPayload,
      });
      setMessage("");
    }
  };

  const setMode2 = (m: "standard" | "executive" | "document") => {
    setResponseMode(m);
    localStorage.setItem("curalink_response_mode", m);
  };
  const needsDoc = responseMode === "document" && selectedDocumentIds.length === 0;
  const canSend = !disabled && !needsDoc && (mode === "natural" ? !!message.trim() : !!(disease.trim() || query.trim()));

  const Seg = ({ items, value, onChange, label }: { items: [string, string][]; value: string; onChange: (v: any) => void; label: string }) => (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-white/10 bg-black/40 p-1">
      {items.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={cn("h-8 rounded-full px-3.5 text-[13px] font-medium transition-all", value === v ? "bg-white text-black" : "text-white/60 hover:text-white")}>
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <div className="rounded-3xl border border-white/12 bg-[#0b0b10] p-3 shadow-[0_20px_60px_-30px_rgba(56,189,248,0.25)] transition-colors focus-within:border-sky-300/40 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <Seg label="Input style" value={mode} onChange={setMode} items={[["natural", "Ask"], ["structured", "Structured"]]} />
        <Seg label="Answer format" value={responseMode} onChange={setMode2} items={[["standard", "Full report"], ["executive", "Briefing"], ["document", "My documents"]]} />
      </div>

      {responseMode === "document" && (
        <div className="mb-3 rounded-2xl border border-amber-300/25 bg-amber-300/[0.05] p-3.5">
          <p className="mb-2.5 flex items-center gap-2 text-[13.5px] text-amber-100/90">
            <FileText className="h-4 w-4" />
            {readyDocs.length === 0 ? "Upload a document first (Documents tab) to answer from your own files." : needsDoc ? "Choose at least one document to answer from." : `Answering from ${selectedDocumentIds.length} document${selectedDocumentIds.length > 1 ? "s" : ""}`}
          </p>
          {readyDocs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {readyDocs.map((d) => {
                const on = selectedDocumentIds.includes(d.documentId);
                return (
                  <button key={d.documentId} type="button" onClick={() => toggleDocument(d.documentId)} title={d.filename} aria-pressed={on} className={cn("max-w-[220px] truncate rounded-full border px-3.5 py-1.5 text-[13px] transition-colors", on ? "border-amber-300/60 bg-amber-300/15 text-amber-100" : "border-white/12 text-white/65 hover:border-white/30 hover:text-white")}>
                    {d.filename}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {mode === "natural" ? (
        <>
          <div className="flex items-end gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={2}
              placeholder="Ask about a condition, treatment, trial or paper…"
              aria-label="Research question"
              disabled={disabled}
              className="max-h-40 min-h-[56px] flex-1 resize-none bg-transparent px-2 py-2 text-[15.5px] leading-relaxed text-white outline-none placeholder:text-white/30"
            />
            <button type="button" onClick={submit} disabled={!canSend} aria-label="Run investigation" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-black transition-all hover:bg-sky-100 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/35">
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-white/8 pt-2.5">
            <button type="button" onClick={() => setAdvancedOpen((o) => !o)} aria-expanded={advancedOpen} className="flex items-center gap-1.5 text-[13px] text-white/50 transition-colors hover:text-white">
              {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} Patient context
            </button>
            <span className="hidden text-[12.5px] text-white/35 sm:block">Enter to send · Shift+Enter for a new line</span>
          </div>
          {advancedOpen && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="relative block"><User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-white/35" /><input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient name" aria-label="Patient name" className={cn(inputCls, "pl-10")} /></label>
              <label className="relative block"><Stethoscope className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-white/35" /><input value={disease} onChange={(e) => setDisease(e.target.value)} placeholder="Condition" aria-label="Condition" className={cn(inputCls, "pl-10")} /></label>
              <label className="relative block"><MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-white/35" /><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" aria-label="Location" className={cn(inputCls, "pl-10")} /></label>
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="relative block"><User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-white/35" /><input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient name (optional)" aria-label="Patient name" className={cn(inputCls, "pl-10")} /></label>
          <label className="relative block"><MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-white/35" /><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" aria-label="Location" className={cn(inputCls, "pl-10")} /></label>
          <label className="relative block"><Stethoscope className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-white/35" /><input value={disease} onChange={(e) => setDisease(e.target.value)} placeholder="Condition, for example melanoma" aria-label="Condition" className={cn(inputCls, "pl-10")} /></label>
          <div className="flex gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Your question" aria-label="Your question" className={inputCls} />
            <button type="button" onClick={submit} disabled={!canSend} aria-label="Run investigation" className="grid h-11 w-12 shrink-0 place-items-center rounded-full bg-white text-black transition-all hover:bg-sky-100 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/35">
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
