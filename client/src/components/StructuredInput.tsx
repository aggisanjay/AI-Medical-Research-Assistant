import { useState } from "react";
import { Search, Send, Sparkles, User, Stethoscope, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import type { SendMessagePayload } from "@/lib/api";

interface Props {
  onSubmit: (payload: SendMessagePayload) => void;
  disabled?: boolean;
}

export function StructuredInput({ onSubmit, disabled }: Props) {
  const [mode, setMode] = useState<"natural" | "structured">("natural");
  const [message, setMessage] = useState("");
  const [patientName, setPatientName] = useState("");
  const [disease, setDisease] = useState("");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const submit = () => {
    if (disabled) return;
    if (mode === "structured") {
      if (!disease.trim() && !query.trim()) return;
      onSubmit({ isStructured: true, patientName, disease, query, location });
      setQuery("");
    } else {
      if (!message.trim()) return;
      onSubmit({
        message,
        patientName: advancedOpen ? patientName : undefined,
        disease: advancedOpen ? disease : undefined,
        location: advancedOpen ? location : undefined,
      });
      setMessage("");
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-card)] p-3 transition-all focus-within:border-primary/40 focus-within:shadow-[var(--shadow-elegant)]">
      <div className="flex items-center gap-1 mb-2 px-1">
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
              disabled={disabled || !message.trim()}
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
            disabled={disabled || (!disease.trim() && !query.trim())}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
          >
            <Search className="h-4 w-4" />
            Search Research
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
