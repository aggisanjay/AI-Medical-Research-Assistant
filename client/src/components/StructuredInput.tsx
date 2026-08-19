import { useState } from "react";
import { Search, Send, Sparkles, User, Stethoscope, MapPin, ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { DocumentSummary, SendMessagePayload } from "@/lib/api";
import { cn } from "@/lib/utils";

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

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-2 sm:p-2.5 space-y-2 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-0.5">
        <div className="flex items-center gap-1 bg-black/70 p-0.5 rounded-full border border-white/8">
          <button
            onClick={() => setMode("natural")}
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-all ${
              mode === "natural" ? "bg-white text-black font-semibold shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="inline h-2.5 w-2.5 mr-1" />
            Natural
          </button>
          <button
            onClick={() => setMode("structured")}
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-all ${
              mode === "structured" ? "bg-white text-black font-semibold shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            <Stethoscope className="inline h-2.5 w-2.5 mr-1" />
            Structured
          </button>
        </div>

        <div className="flex items-center gap-1 bg-black/70 p-0.5 rounded-full border border-white/8">
          <button
            onClick={() => {
              setResponseMode("standard");
              localStorage.setItem("curalink_response_mode", "standard");
            }}
            className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-all ${
              responseMode === "standard"
                ? "bg-[#18181b] text-white border border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Research Mode
          </button>
          <button
            onClick={() => {
              setResponseMode("executive");
              localStorage.setItem("curalink_response_mode", "executive");
            }}
            className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-all ${
              responseMode === "executive"
                ? "bg-[#2563EB] text-white font-semibold shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Executive Mode
          </button>
          <button
            onClick={() => {
              setResponseMode("document");
              localStorage.setItem("curalink_response_mode", "document");
            }}
            className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-all ${
              responseMode === "document"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Document Q&A
          </button>
        </div>
      </div>

      {responseMode === "document" && selectedDocumentIds.length === 0 && (
        <div className="text-[11px] text-slate-300 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <div className="text-[10px] text-slate-400">
            <span className="font-semibold text-white mr-1">Select Document:</span>
            Pick at least one uploaded document below to ground research.
          </div>
        </div>
      )}

      {responseMode === "document" && readyDocs.length > 0 && (
        <div className="px-0.5">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mb-1">
            <FileText className="h-2.5 w-2.5 text-white" />
            Ground with documents
          </div>
          <div className="flex flex-wrap gap-1">
            {readyDocs.map((doc) => {
              const selected = selectedDocumentIds.includes(doc.documentId);
              return (
                <button
                  key={doc.documentId}
                  type="button"
                  onClick={() => toggleDocument(doc.documentId)}
                  disabled={disabled}
                  className={cn(
                    "text-[9px] px-2.5 py-0.5 rounded-full border transition-all truncate max-w-[160px]",
                    selected
                      ? "bg-white text-black border-white font-medium"
                      : "bg-black/40 border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
                  )}
                  title={doc.filename}
                >
                  {doc.filename}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === "natural" ? (
        <>
          <div className="flex items-center gap-2 bg-black border border-white/8 rounded-xl px-2.5 py-1.5 focus-within:border-white/20 transition-all">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask about treatments, trials, or recent research…"
              rows={1}
              className="flex-1 resize-none bg-transparent px-1 py-0.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none font-normal min-h-[32px] max-h-[100px]"
              disabled={disabled}
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className={cn(
                  "text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors cursor-pointer",
                  advancedOpen 
                    ? "border-white/20 text-white bg-white/5" 
                    : "border-transparent text-slate-500 hover:text-slate-300"
                )}
                title="Toggle Patient Context"
              >
                <User className="h-3 w-3" />
                <span className="hidden sm:inline">Context</span>
                {advancedOpen ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
              </button>
              <button
                onClick={submit}
                disabled={disabled || !message.trim() || (responseMode === "document" && selectedDocumentIds.length === 0)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white transition-all hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                aria-label="Send query"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {advancedOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
              <Field icon={User} value={patientName} onChange={setPatientName} placeholder="Patient name" />
              <Field icon={Stethoscope} value={disease} onChange={setDisease} placeholder="Disease / Condition" />
              <Field icon={MapPin} value={location} onChange={setLocation} placeholder="Location" />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-1.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <Field icon={User} value={patientName} onChange={setPatientName} placeholder="Patient name (optional)" />
            <Field icon={Stethoscope} value={disease} onChange={setDisease} placeholder="Disease / condition" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1.5">
            <Field icon={Search} value={query} onChange={setQuery} placeholder="Specific question (e.g. latest immunotherapy)" onEnter={submit} />
            <Field icon={MapPin} value={location} onChange={setLocation} placeholder="Location" />
          </div>
          <button
            onClick={submit}
            disabled={disabled || (!disease.trim() && !query.trim()) || (responseMode === "document" && selectedDocumentIds.length === 0)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-white py-2 text-xs font-semibold tracking-wide transition-all hover:bg-blue-600 disabled:opacity-40 cursor-pointer"
          >
            <Search className="h-3 w-3" />
            {responseMode === "document" ? "Search Document" : "Search Research"}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({
  icon: Icon,
  value,
  onChange,
  placeholder,
  onEnter,
}: {
  icon: any;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onEnter?: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-black/60 px-2.5 py-1.5">
      <Icon className="h-3 w-3 text-slate-500 shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none min-w-0 font-normal"
      />
    </div>
  );
}
