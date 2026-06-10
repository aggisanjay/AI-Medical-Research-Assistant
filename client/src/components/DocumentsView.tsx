import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileUp,
} from "lucide-react";
import { api, type DocumentSummary } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DocumentsViewProps {
  onDocumentsChange?: () => void;
}

export function DocumentsView({ onDocumentsChange }: DocumentsViewProps) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(() => {
    setLoading(true);
    api
      .listDocuments()
      .then((res) => setDocuments(res.data || []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.uploadDocument(file);
      setSuccess(`"${file.name}" processed and ready for research queries.`);
      fetchDocuments();
      onDocumentsChange?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onFileSelect = (files: FileList | null) => {
    const file = files?.[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (documentId: string) => {
    try {
      await api.deleteDocument(documentId);
      setDocuments((prev) => prev.filter((d) => d.documentId !== documentId));
      onDocumentsChange?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Document Library</h1>
        <p className="text-sm text-slate-400 mt-1 font-light">
          Upload clinical notes or research papers. Select documents in the Research Workspace to
          ground AI responses.
        </p>
      </div>

      <div
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          onFileSelect(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all",
          dragActive
            ? "border-cyan-500/50 bg-cyan-500/5"
            : "border-white/10 bg-slate-900/40 hover:border-blue-500/30 hover:bg-slate-900/60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.pdf,text/plain,application/pdf"
          className="hidden"
          onChange={(e) => onFileSelect(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileUp className="h-6 w-6 text-blue-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              {uploading ? "Processing document…" : "Drop file here or click to upload"}
            </p>
            <p className="text-xs text-slate-500 mt-1">TXT or PDF · Max 10 MB</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3.5 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-3.5 py-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Your Documents
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{documents.length} files</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading…
          </div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 font-light">
            No documents yet. Upload a .txt file to get started.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {documents.map((doc) => (
              <li
                key={doc.documentId}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-900/60 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.filename}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {doc.chunkCount} chunks · {((doc.charCount || 0) / 1024).toFixed(1)} KB ·{" "}
                    {doc.mimeType === "application/pdf" ? "PDF" : "TXT"}
                  </p>
                </div>
                <StatusBadge status={doc.status} />
                <button
                  onClick={() => handleDelete(doc.documentId)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ready") {
    return (
      <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Ready
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        Processing
      </span>
    );
  }
  return (
    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
      Failed
    </span>
  );
}
