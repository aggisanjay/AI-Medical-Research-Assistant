import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, FileUp, Layers, Loader2, Trash2, Upload, X } from "lucide-react";
import { api, type DocumentSummary } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Btn, Chip, Empty, Num, PageHead, Panel, Skeleton, Stat } from "@/components/ui/kit";

interface DocumentsViewProps {
  onDocumentsChange?: () => void;
}

const fmtSize = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export function DocumentsView({ onDocumentsChange }: DocumentsViewProps) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(() => {
    setLoading(true);
    api.listDocuments().then((r) => setDocuments(r.data || [])).catch(() => setDocuments([])).finally(() => setLoading(false));
  }, []);
  useEffect(() => fetchDocuments(), [fetchDocuments]);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.uploadDocument(file);
      setSuccess(`"${file.name}" was processed and is ready for research queries.`);
      fetchDocuments();
      onDocumentsChange?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.deleteDocument(id);
      setDocuments((p) => p.filter((d) => d.documentId !== id));
      setConfirm(null);
      onDocumentsChange?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const ready = documents.filter((d) => d.status === "ready").length;
  const chunks = documents.reduce((a, d) => a + (d.chunkCount || 0), 0);

  return (
    <div className="view-stagger space-y-5 pb-12">
      <PageHead
        title="Documents"
        description="Upload your own papers and notes. CuraLink splits them into passages so answers can cite your files alongside PubMed, OpenAlex and ClinicalTrials.gov."
        actions={
          <Btn variant="primary" size="sm" icon={uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? "Processing…" : "Upload file"}
          </Btn>
        }
      />
      <input ref={inputRef} type="file" accept=".txt,.pdf,text/plain,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />

      <div className="grid gap-3.5 sm:grid-cols-3">
        <Stat loading={loading} label="Documents" icon={FileText} color="#fbbf24" value={<Num value={documents.length} />} hint="In your workspace" />
        <Stat loading={loading} label="Ready to search" icon={CheckCircle2} color="#34d399" value={<Num value={ready} />} hint="Processed and embedded" />
        <Stat loading={loading} label="Passages" icon={Layers} color="#38bdf8" value={<Num value={chunks} />} hint="Searchable text chunks" />
      </div>

      {(error || success) && (
        <div role={error ? "alert" : "status"} className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3", error ? "border-red-400/30 bg-red-400/[0.07]" : "border-emerald-400/30 bg-emerald-400/[0.07]")}>
          {error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />}
          <p className={cn("flex-1 text-[13px]", error ? "text-red-100" : "text-emerald-100")}>{error || success}</p>
          <button aria-label="Dismiss" onClick={() => { setError(null); setSuccess(null); }} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f); }}
        className={cn("rounded-xl border-2 border-dashed px-5 py-7 text-center transition-all duration-200", drag ? "scale-[1.01] border-sky-300 bg-sky-300/[0.07]" : "border-white/14 bg-white/[0.02] hover:border-white/28")}
      >
        <span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-sky-300">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileUp className="h-5 w-5" />}
        </span>
        <p className="text-[14px] font-medium text-white">{uploading ? "Reading and embedding your file…" : drag ? "Drop to upload" : "Drag a file here"}</p>
        <p className="mt-1 text-[12.5px] text-white/50">TXT or PDF, up to 10 MB.</p>
        {!uploading && <Btn variant="secondary" size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>Choose a file</Btn>}
      </div>

      <Panel padded={false}>
        <div className="flex items-center justify-between px-4 pb-3 pt-4 sm:px-5">
          <h2 className="text-[14.5px] font-medium text-white">Your documents</h2>
          <span className="text-[12px] text-white/40">{documents.length} total</span>
        </div>
        {loading ? (
          <div className="space-y-2.5 px-4 pb-5 sm:px-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : documents.length === 0 ? (
          <Empty icon={FileText} title="No documents yet" body="Upload a paper or your own notes and ask questions grounded in them." />
        ) : (
          <ul className="divide-y divide-white/8 border-t border-white/8">
            {documents.map((d) => (
              <li key={d.documentId} className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-3 sm:px-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-amber-300"><FileText className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate text-[13.5px] text-white">{d.filename}</p>
                  <p className="mt-0.5 text-[12px] text-white/45">
                    {fmtSize(d.fileSize)} · {d.chunkCount} passages · {fmtDate(d.createdAt)}
                    {d.embeddingModel ? ` · ${d.embeddingModel}` : ""}
                  </p>
                </div>
                {d.status === "ready" && <Chip color="#34d399">Ready</Chip>}
                {d.status === "processing" && <Chip color="#fbbf24"><Loader2 className="h-3 w-3 animate-spin" />Processing</Chip>}
                {d.status === "failed" && <Chip color="#f87171">Failed</Chip>}
                {confirm === d.documentId ? (
                  <div className="flex items-center gap-2">
                    <Btn size="sm" variant="danger" onClick={() => remove(d.documentId)}>Delete</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setConfirm(null)}>Cancel</Btn>
                  </div>
                ) : (
                  <button aria-label={`Delete ${d.filename}`} title="Delete" onClick={() => setConfirm(d.documentId)} className="grid h-10 w-10 place-items-center rounded-full text-white/40 transition-colors hover:bg-red-400/10 hover:text-red-300"><Trash2 className="h-[18px] w-[18px]" /></button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
