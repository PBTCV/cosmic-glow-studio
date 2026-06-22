"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/admin-token";
import { apiPost } from "@/lib/next-api-client";

type AdminContextValue = {
  token: string;
  lock: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within an authenticated admin route");
  return ctx;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTokenState(getAdminToken());
    setReady(true);
  }, []);

  function unlock(t: string) {
    setAdminToken(t);
    setTokenState(t);
  }

  function lock() {
    clearAdminToken();
    setTokenState(null);
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--gold)]/30 border-t-[var(--gold)] animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-foreground">
        <Unlock onSuccess={unlock} />
        <Toaster />
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ token, lock }}>
      <div className="min-h-screen bg-[var(--background)] text-foreground">
        <AdminNav onLock={lock} />
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10">
          {children}
        </main>
        <Toaster />
      </div>
    </AdminContext.Provider>
  );
}

function AdminNav({ onLock }: { onLock: () => void }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin", label: "Consultations", match: (p: string) => p === "/admin" },
    {
      href: "/admin/astrologers",
      label: "Astrologers",
      match: (p: string) => p.startsWith("/admin/astrologers"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--gold)]/15 bg-[var(--background)]/90 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-4 flex items-center gap-6">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-xs label-caps text-muted-foreground">Admin</span>
        </div>
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-[var(--gold)]/15 text-[var(--gold)] font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-[var(--gold)] transition-colors hidden sm:inline"
          >
            View site
          </Link>
          <Button variant="outline" size="sm" onClick={onLock}>
            Lock
          </Button>
        </div>
      </div>
    </header>
  );
}

function Unlock({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await apiPost<{ ok: boolean }>("/api/admin/verify", { token: value.trim() });
      onSuccess(value.trim());
      toast.success("Welcome back");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid password";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <form
        onSubmit={submit}
        className="w-full max-w-md border border-[var(--gold)]/20 bg-[var(--charcoal)] rounded-xl p-8 md:p-10 space-y-6 shadow-xl"
      >
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl text-[var(--gold)]">Admin Access</h1>
          <p className="text-sm text-white/60">
            Enter your admin password to manage consultations and astrologers.
          </p>
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            autoFocus
            autoComplete="current-password"
            placeholder="Password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            className="h-11 bg-white/10 border-[var(--gold)]/30 text-white placeholder:text-white/50 caret-[var(--gold)]"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <Button type="submit" disabled={busy || !value.trim()} className="w-full h-11">
          {busy ? "Verifying…" : "Unlock dashboard"}
        </Button>
      </form>
    </div>
  );
}
