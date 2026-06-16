import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { verifyAdminToken } from "@/lib/admin.functions";
import {
  listConsultations, updateConsultationStatus, addAuditNote,
} from "@/lib/consultations.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — Elite Vedic" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const STORAGE_KEY = "ev_admin_token";
const STATUSES = ["new", "contacted", "scheduled", "closed", "spam"] as const;
type Status = typeof STATUSES[number];

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

function AdminPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem(STORAGE_KEY);
    if (t) setToken(t);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground">
      {token ? (
        <Dashboard
          token={token}
          onLock={() => {
            sessionStorage.removeItem(STORAGE_KEY);
            setToken(null);
          }}
        />
      ) : (
        <Unlock
          onSuccess={(t) => {
            sessionStorage.setItem(STORAGE_KEY, t);
            setToken(t);
          }}
        />
      )}
      <Toaster />
    </div>
  );
}

function Unlock({ onSuccess }: { onSuccess: (token: string) => void }) {
  const verify = useServerFn(verifyAdminToken);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    try {
      await verify({ data: { token: value } });
      onSuccess(value);
    } catch {
      toast.error("Invalid password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border border-[var(--gold)]/20 bg-[var(--charcoal)] rounded-lg p-8 space-y-5"
      >
        <div>
          <h1 className="font-display text-2xl text-[var(--gold)]">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the admin password to continue.
          </p>
        </div>
        <Input
          type="password"
          autoFocus
          autoComplete="off"
          placeholder="Password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Verifying…" : "Unlock"}
        </Button>
      </form>
    </div>
  );
}

function Dashboard({ token, onLock }: { token: string; onLock: () => void }) {
  const list = useServerFn(listConsultations);
  const updateStatus = useServerFn(updateConsultationStatus);
  const addNote = useServerFn(addAuditNote);

  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await list({
        data: { adminToken: token, status: status || undefined, limit, offset },
      });
      setRows(res.rows as Row[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
      if (err instanceof Error && err.message.includes("Unauthorized")) onLock();
    } finally {
      setLoading(false);
    }
  }, [list, token, status, offset, onLock]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStatus(id: string, next: Status) {
    try {
      await updateStatus({ data: { id, status: next, adminToken: token } });
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
      toast.success("Status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  async function note(id: string) {
    const text = window.prompt("Add note:");
    if (!text) return;
    try {
      await addNote({ data: { id, note: text, adminToken: token } });
      toast.success("Note added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
      <nav className="flex items-center gap-6 mb-8 pb-4 border-b border-[var(--gold)]/15">
        <a href="/admin" className="text-sm text-[var(--gold)] font-medium">Consultations</a>
        <a href="/admin/astrologers" className="text-sm text-muted-foreground hover:text-[var(--gold)]">Astrologers</a>
      </nav>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-[var(--gold)]">Consultations</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setOffset(0);
              setStatus(e.target.value);
            }}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </Button>
          <Button variant="outline" onClick={onLock}>Lock</Button>
        </div>
      </div>

      <div className="border border-[var(--gold)]/15 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No inquiries
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">{r.full_name}</TableCell>
                <TableCell>
                  <a className="hover:text-[var(--gold)]" href={`mailto:${r.email}`}>{r.email}</a>
                </TableCell>
                <TableCell>{r.phone ?? "—"}</TableCell>
                <TableCell className="max-w-[320px] truncate" title={r.question}>{r.question}</TableCell>
                <TableCell>
                  <select
                    value={r.status}
                    onChange={(e) => changeStatus(r.id, e.target.value as Status)}
                    className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => note(r.id)}>Note</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <span className="text-xs text-muted-foreground">
          Showing {rows.length} · offset {offset}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Prev
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
    </div>
  );
}
