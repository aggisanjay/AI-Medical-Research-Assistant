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
    <div className="editorial-card border border-white/8 p-4 space-y-3">
      <div className="flex items-center justify-between gap-1 px-1">
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-full border border-white/8">
          <button
            onClick={() => setMode("natural")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
              mode === "natural" ? "bg-white text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="inline h-3 w-3 mr-1" />
            Natural
          </button>
          <button
            onClick={() => setMode("structured")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
              mode === "structured" ? "bg-white text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            <Stethoscope className="inline h-3 w-3 mr-1" />
            Structured
          </button>
        </div>

        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-full border border-white/8">
          <button
            onClick={() => {
              setResponseMode("standard");
              localStorage.setItem("curalink_response_mode", "standard");
            }}
            className={`text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium transition-all ${
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
            className={`text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium transition-all ${
              responseMode === "executive"
                ? "bg-[#2563EB] text-white font-semibold"
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
            className={`text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium transition-all ${
              responseMode === "document"
                ? "bg-white text-black font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Document Q&A
          </button>
        </div>
      </div>

      {responseMode === "document" && selectedDocumentIds.length === 0 && (
        <div className="mx-1 text-[11px] text-slate-300 bg-black/60 border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-white shrink-0" />
          <div>
            <div className="font-semibold text-white">Document Grounding Required</div>
            <div className="text-[10px] text-slate-400 font-normal mt-0.5">Please select at least one of your uploaded documents below to enable search.</div>
          </div>
        </div>
      )}

      {responseMode === "document" && readyDocs.length > 0 && (
        <div className="px-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1.5">
            <FileText className="h-3 w-3 text-white" />
            Ground with documents
          </div>
          <div className="flex flex-wrap gap-1.5">
            {readyDocs.map((doc) => {
              const selected = selectedDocumentIds.includes(doc.documentId);
              return (
                <button
                  key={doc.documentId}
                  type="button"
                  onClick={() => toggleDocument(doc.documentId)}
                  disabled={disabled}
                  className={cn(
                    "text-[10px] px-3 py-1 rounded-full border transition-all truncate max-w-[180px]",
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
          <div className="flex items-end gap-2 bg-black/60 border border-white/8 rounded-2xl p-2.5 focus-within:border-white/20 transition-all">
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
              rows={2}
              className="flex-1 resize-none bg-transparent px-2 py-1 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none font-normal"
              disabled={disabled}
            />
            <button
              onClick={submit}
              disabled={disabled || !message.trim() || (responseMode === "document" && selectedDocumentIds.length === 0)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-white transition-all hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
              aria-label="Send query"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 px-1 cursor-pointer transition-colors"
          >
            {advancedOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Patient context
          </button>
          {advancedOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <Field icon={User} value={patientName} onChange={setPatientName} placeholder="Patient name" />
              <Field icon={Stethoscope} value={disease} onChange={setDisease} placeholder="Disease" />
              <Field icon={MapPin} value={location} onChange={setLocation} placeholder="Location" />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field icon={User} value={patientName} onChange={setPatientName} placeholder="Patient name (optional)" />
            <Field icon={Stethoscope} value={disease} onChange={setDisease} placeholder="Disease / condition" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <Field icon={Search} value={query} onChange={setQuery} placeholder="Specific question (e.g., latest immunotherapy)" onEnter={submit} />
            <Field icon={MapPin} value={location} onChange={setLocation} placeholder="Location" />
          </div>
          <button
            onClick={submit}
            disabled={disabled || (!disease.trim() && !query.trim()) || (responseMode === "document" && selectedDocumentIds.length === 0)}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#2563EB] text-white py-2.5 text-xs font-semibold tracking-wide transition-all hover:bg-blue-600 disabled:opacity-40 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
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
    <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-black/60 px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-slate-500" />
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
