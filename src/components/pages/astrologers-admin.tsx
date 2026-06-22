"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmin } from "@/components/admin/admin-shell";
import { apiPost } from "@/lib/next-api-client";

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

export function AstrologersAdmin() {
  const { token, lock } = useAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiPost<{ rows: Row[] }>("/api/astrologers/admin/list", {}, token);
      setRows(res.rows as Row[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      toast.error(msg);
      if (msg.includes("Unauthorized")) lock();
    } finally {
      setLoading(false);
    }
  }, [token, lock]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await apiPost("/api/astrologers/admin/delete", { id }, token);
      toast.success("Deleted");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-[var(--gold)]">Astrologers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage council profiles</p>
        </div>
        <Link
          href="/admin/astrologers/new"
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          + New astrologer
        </Link>
      </div>

      <div className="border border-[var(--gold)]/15 rounded-xl overflow-hidden bg-card/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Title</TableHead>
                <TableHead className="hidden lg:table-cell">Specialties</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full max-w-[100px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                    <p className="font-display text-lg text-foreground/70">No astrologers yet</p>
                    <p className="text-sm mt-1">
                      Create your first council profile to get started.
                    </p>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {r.photo_url ? (
                        <img
                          src={r.photo_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-[var(--gold)]/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          {r.full_name.charAt(0)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {r.honorific ? `${r.honorific} ` : ""}
                      {r.full_name}
                      {r.is_featured && (
                        <span className="ml-1.5 text-[var(--gold)]" title="Featured">
                          ★
                        </span>
                      )}
                      <div className="text-xs text-muted-foreground">/{r.slug}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{r.title ?? "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[260px] truncate">
                      {(r.specialties ?? []).join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${
                          r.is_active
                            ? "bg-emerald-500/15 text-emerald-800 border-emerald-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-3 whitespace-nowrap">
                      <Link
                        href={`/admin/astrologers/${r.id}?tab=services`}
                        className="text-sm text-muted-foreground hover:text-[var(--gold)]"
                      >
                        Services
                      </Link>
                      <Link
                        href={`/admin/astrologers/${r.id}`}
                        className="text-sm text-[var(--gold)] hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => void remove(r.id, r.full_name)}
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
    </>
  );
}
