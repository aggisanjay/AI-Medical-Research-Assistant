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
    <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-card)] p-3 transition-all focus-within:border-primary/40 focus-within:shadow-[var(--shadow-elegant)]">
      <div className="flex items-center justify-between gap-1 mb-2 px-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode("natural")}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
              mode === "natural" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sparkles className="inline h-3 w-3 mr-1" />
            Natural
          </button>
          <button
            onClick={() => setMode("structured")}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
              mode === "structured" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Stethoscope className="inline h-3 w-3 mr-1" />
            Structured
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              setResponseMode("standard");
              localStorage.setItem("curalink_response_mode", "standard");
            }}
            className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
              responseMode === "standard"
                ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Research Mode
          </button>
          <button
            onClick={() => {
              setResponseMode("executive");
              localStorage.setItem("curalink_response_mode", "executive");
            }}
            className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
              responseMode === "executive"
                ? "bg-blue-600 text-white shadow-sm border border-blue-500/50 font-semibold shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Executive Mode
          </button>
          <button
            onClick={() => {
              setResponseMode("document");
              localStorage.setItem("curalink_response_mode", "document");
            }}
            className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
              responseMode === "document"
                ? "bg-purple-600 text-white shadow-sm border border-purple-500/50 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Document Q&A
          </button>
        </div>
      </div>

      {responseMode === "document" && selectedDocumentIds.length === 0 && (
        <div className="mb-2 mx-1 text-[11px] text-purple-300 bg-purple-950/20 border border-purple-900/30 rounded-xl px-4 py-2.5 flex items-center gap-2.5">
          <FileText className="h-4.5 w-4.5 text-purple-400 shrink-0" />
          <div>
            <div className="font-semibold text-purple-200">Document Grounding Required</div>
            <div className="text-[10px] text-purple-300/80 font-light mt-0.5">Please select at least one of your uploaded documents below to enable search.</div>
          </div>
        </div>
      )}

      {responseMode === "document" && readyDocs.length > 0 && (
        <div className="mb-2 px-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1.5">
            <FileText className="h-3 w-3" />
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
                    "text-[10px] px-2.5 py-1 rounded-full border transition-colors truncate max-w-[180px]",
                    selected
                      ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                      : "bg-muted/50 border-border text-muted-foreground hover:border-purple-500/30"
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
          <div className="flex items-end gap-2">
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
              className="flex-1 resize-none bg-transparent px-2 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
              disabled={disabled}
            />
            <button
              onClick={submit}
              disabled={disabled || !message.trim() || (responseMode === "document" && selectedDocumentIds.length === 0)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            className="mt-1 text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-1"
          >
            {advancedOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Patient context
          </button>
          {advancedOpen && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Field icon={User} value={patientName} onChange={setPatientName} placeholder="Patient name" />
              <Field icon={Stethoscope} value={disease} onChange={setDisease} placeholder="Disease" />
              <Field icon={MapPin} value={location} onChange={setLocation} placeholder="Location" />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field icon={User} value={patientName} onChange={setPatientName} placeholder="Patient name (optional)" />
            <Field icon={Stethoscope} value={disease} onChange={setDisease} placeholder="Disease / condition" />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Field icon={Search} value={query} onChange={setQuery} placeholder="Specific question (e.g., latest immunotherapy)" onEnter={submit} />
            <Field icon={MapPin} value={location} onChange={setLocation} placeholder="Location" />
          </div>
          <button
            onClick={submit}
            disabled={disabled || (!disease.trim() && !query.trim()) || (responseMode === "document" && selectedDocumentIds.length === 0)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
          >
            <Search className="h-4 w-4" />
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
    <div className="flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none min-w-0"
      />
    </div>
  );
}
