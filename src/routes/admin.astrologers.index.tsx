import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { clearAdminToken, getAdminToken } from "@/lib/admin-token";
import { deleteAstrologer, listAstrologersAdmin } from "@/lib/astrologers.functions";

export const Route = createFileRoute("/admin/astrologers/")({
  head: () => ({ meta: [{ title: "Astrologers — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AstrologersAdmin,
});

type Row = {
  id: string;
  slug: string;
  full_name: string;
  honorific: string | null;
  title: string | null;
  photo_url: string | null;
  tagline: string | null;
  specialties: string[];
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
};

function AstrologersAdmin() {
  const navigate = useNavigate();
  const list = useServerFn(listAstrologersAdmin);
  const del = useServerFn(deleteAstrologer);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = getAdminToken();
    if (!t) {
      void navigate({ to: "/admin" });
      return;
    }
    setToken(t);
  }, [navigate]);

  const load = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const res = await list({ data: { adminToken: t } });
      setRows(res.rows as Row[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      toast.error(msg);
      if (msg.includes("Unauthorized")) {
        clearAdminToken();
        void navigate({ to: "/admin" });
      }
    } finally {
      setLoading(false);
    }
  }, [list, navigate]);

  useEffect(() => {
    if (token) void load(token);
  }, [token, load]);

  async function remove(id: string, name: string) {
    if (!token) return;
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await del({ data: { id, adminToken: token } });
      toast.success("Deleted");
      void load(token);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        <AdminNav />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-[var(--gold)]">Astrologers</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage council profiles</p>
          </div>
          <Link
            to="/admin/astrologers/$id"
            params={{ id: "new" }}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            + New astrologer
          </Link>
        </div>

        <div className="border border-[var(--gold)]/15 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No astrologers yet — click "New astrologer" to add one.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.photo_url ? (
                      <img src={r.photo_url} alt="" className="w-10 h-10 rounded-full object-cover border border-[var(--gold)]/30" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {r.honorific ? `${r.honorific} ` : ""}{r.full_name}
                    <div className="text-xs text-muted-foreground">/{r.slug}</div>
                  </TableCell>
                  <TableCell>{r.title ?? "—"}</TableCell>
                  <TableCell className="max-w-[260px] truncate">
                    {(r.specialties ?? []).join(", ") || "—"}
                  </TableCell>
                  <TableCell>{r.display_order}</TableCell>
                  <TableCell>{r.is_active ? "Yes" : "No"}</TableCell>
                  <TableCell>{r.is_featured ? "★" : "—"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link
                      to="/admin/astrologers/$id"
                      params={{ id: r.id }}
                      className="text-sm text-[var(--gold)] hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => remove(r.id, r.full_name)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

function AdminNav() {
  return (
    <nav className="flex items-center gap-6 mb-8 pb-4 border-b border-[var(--gold)]/15">
      <Link to="/admin" className="text-sm text-muted-foreground hover:text-[var(--gold)]">Consultations</Link>
      <Link to="/admin/astrologers" className="text-sm text-[var(--gold)] font-medium">Astrologers</Link>
      <button
        onClick={() => { clearAdminToken(); window.location.href = "/admin"; }}
        className="ml-auto text-sm text-muted-foreground hover:text-foreground"
      >
        Lock
      </button>
    </nav>
  );
}