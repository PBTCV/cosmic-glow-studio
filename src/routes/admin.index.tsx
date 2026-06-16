import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmin } from "@/components/admin/admin-shell";
import {
  addAuditNote, listConsultations, updateConsultationStatus,
} from "@/lib/consultations.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Consultations — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConsultationsAdmin,
});

const STATUSES = ["new", "contacted", "scheduled", "closed", "spam"] as const;
type Status = (typeof STATUSES)[number];

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  dob: string | null;
  birth_time: string | null;
  birth_place: string | null;
  question: string;
  status: Status;
  created_at: string;
  updated_at: string;
};

const STATUS_STYLE: Record<Status, string> = {
  new: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  contacted: "bg-amber-500/15 text-amber-800 border-amber-500/30",
  scheduled: "bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30",
  closed: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30",
  spam: "bg-destructive/15 text-destructive border-destructive/30",
};

function ConsultationsAdmin() {
  const { token, lock } = useAdmin();
  const list = useServerFn(listConsultations);
  const updateStatus = useServerFn(updateConsultationStatus);
  const addNote = useServerFn(addAuditNote);

  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Row | null>(null);
  const [noteTarget, setNoteTarget] = useState<Row | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await list({
        data: { adminToken: token, status: status || undefined, limit, offset },
      });
      setRows(res.rows as Row[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      toast.error(msg);
      if (msg.includes("Unauthorized")) lock();
    } finally {
      setLoading(false);
    }
  }, [list, token, status, offset, lock]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStatus(id: string, next: Status) {
    try {
      await updateStatus({ data: { id, status: next, adminToken: token } });
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
      setSelected((s) => (s?.id === id ? { ...s, status: next } : s));
      toast.success("Status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function submitNote() {
    if (!noteTarget || !noteText.trim()) return;
    setNoteBusy(true);
    try {
      await addNote({ data: { id: noteTarget.id, note: noteText.trim(), adminToken: token } });
      toast.success("Note saved");
      setNoteTarget(null);
      setNoteText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setNoteBusy(false);
    }
  }

  function copyText(text: string, label: string) {
    void navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-[var(--gold)]">Consultations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage client inquiries
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[{ value: "", label: "All" }, ...STATUSES.map((s) => ({ value: s, label: s }))].map((f) => (
          <button
            key={f.value || "all"}
            type="button"
            onClick={() => {
              setOffset(0);
              setStatus(f.value);
            }}
            className={`px-3 py-1.5 rounded-full text-xs label-caps border transition-colors ${
              status === f.value
                ? "bg-[var(--gold)]/15 border-[var(--gold)]/40 text-[var(--gold)]"
                : "border-border text-muted-foreground hover:border-[var(--gold)]/30 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="border border-[var(--gold)]/15 rounded-xl overflow-hidden bg-card/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Received</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Question</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full max-w-[120px]" /></TableCell>
                    ))}
                  </TableRow>
                ))}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                    <p className="font-display text-lg text-foreground/70">No inquiries yet</p>
                    <p className="text-sm mt-1">New consultation requests will appear here.</p>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                rows.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap align-top pt-4">
                      <div>{formatDate(r.created_at)}</div>
                      <div className="text-[10px] opacity-70">{formatRelative(r.created_at)}</div>
                    </TableCell>
                    <TableCell className="font-medium align-top pt-4">{r.full_name}</TableCell>
                    <TableCell className="align-top pt-4">
                      <a
                        href={`mailto:${r.email}`}
                        className="text-sm hover:text-[var(--gold)] block truncate max-w-[180px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.email}
                      </a>
                      {r.phone && (
                        <a
                          href={`tel:${r.phone}`}
                          className="text-xs text-muted-foreground hover:text-[var(--gold)] block mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {r.phone}
                        </a>
                      )}
                    </TableCell>
                    <TableCell
                      className="hidden lg:table-cell max-w-[280px] truncate text-sm text-muted-foreground align-top pt-4"
                      title={r.question}
                    >
                      {r.question}
                    </TableCell>
                    <TableCell className="align-top pt-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={r.status}
                        onChange={(e) => void changeStatus(r.id, e.target.value as Status)}
                        className={`h-8 rounded-full border px-2.5 text-xs capitalize cursor-pointer ${STATUS_STYLE[r.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-right align-top pt-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setNoteTarget(r);
                            setNoteText("");
                          }}
                        >
                          Note
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <span className="text-xs text-muted-foreground">
          {loading ? "Loading…" : `${rows.length} result${rows.length === 1 ? "" : "s"}`}
          {offset > 0 && ` · page ${Math.floor(offset / limit) + 1}`}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={rows.length < limit || loading}
            onClick={() => setOffset(offset + limit)}
          >
            Next
          </Button>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="text-left space-y-1 pb-6 border-b border-[var(--gold)]/15">
                <SheetTitle className="font-display text-2xl text-[var(--gold)]">
                  {selected.full_name}
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDate(selected.created_at)}
                </p>
              </SheetHeader>

              <div className="space-y-6 py-6">
                <DetailSection title="Contact">
                  <DetailRow label="Email">
                    <button
                      type="button"
                      className="text-sm hover:text-[var(--gold)] text-left"
                      onClick={() => copyText(selected.email, "Email")}
                    >
                      {selected.email}
                    </button>
                  </DetailRow>
                  <DetailRow label="Phone">
                    {selected.phone ? (
                      <button
                        type="button"
                        className="text-sm hover:text-[var(--gold)]"
                        onClick={() => copyText(selected.phone!, "Phone")}
                      >
                        {selected.phone}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </DetailRow>
                </DetailSection>

                <DetailSection title="Birth details">
                  <DetailRow label="Date of birth">{selected.dob ?? "—"}</DetailRow>
                  <DetailRow label="Birth time">{selected.birth_time ?? "—"}</DetailRow>
                  <DetailRow label="Birth place">{selected.birth_place ?? "—"}</DetailRow>
                </DetailSection>

                <DetailSection title="Question">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.question}</p>
                </DetailSection>

                <DetailSection title="Status">
                  <select
                    value={selected.status}
                    onChange={(e) => void changeStatus(selected.id, e.target.value as Status)}
                    className={`h-9 rounded-full border px-3 text-sm capitalize cursor-pointer ${STATUS_STYLE[selected.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </DetailSection>
              </div>

              <div className="flex gap-2 pt-4 border-t border-[var(--gold)]/15">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selected.email}`}>Email client</a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNoteTarget(selected);
                    setNoteText("");
                  }}
                >
                  Add note
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!noteTarget} onOpenChange={(open) => !open && setNoteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add note</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {noteTarget ? `For ${noteTarget.full_name}` : ""}
          </p>
          <Textarea
            placeholder="Internal note about this inquiry…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteTarget(null)}>Cancel</Button>
            <Button disabled={noteBusy || !noteText.trim()} onClick={() => void submitNote()}>
              {noteBusy ? "Saving…" : "Save note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="label-caps text-xs text-[var(--gold)]/80 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 text-sm">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}
