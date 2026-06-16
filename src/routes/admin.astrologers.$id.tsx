import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getAdminToken, clearAdminToken } from "@/lib/admin-token";
import {
  getAstrologerAdmin, upsertAstrologer,
  upsertService, deleteService,
  upsertAvailability, deleteAvailability,
} from "@/lib/astrologers.functions";

export const Route = createFileRoute("/admin/astrologers/$id")({
  head: () => ({ meta: [{ title: "Edit Astrologer — Admin" }, { name: "robots", content: "noindex" }] }),
  component: EditAstrologer,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MODES = ["in_person", "video", "phone"] as const;

type Profile = {
  id?: string;
  slug?: string;
  full_name: string;
  honorific?: string | null;
  title?: string | null;
  photo_url?: string | null;
  languages: string[];
  years_experience?: number | null;
  specialties: string[];
  certifications: string[];
  lineage?: string | null;
  tagline?: string | null;
  short_bio?: string | null;
  long_bio?: string | null;
  quote?: string | null;
  philosophy?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  linkedin_url?: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
};

type Service = {
  id?: string;
  astrologer_id: string;
  name: string;
  description?: string | null;
  duration_minutes?: number | null;
  price_amount?: number | null;
  price_currency: string;
  modes: ("in_person" | "video" | "phone")[];
  display_order: number;
  is_active: boolean;
};

type Availability = {
  id?: string;
  astrologer_id: string;
  timezone: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const blankProfile = (): Profile => ({
  full_name: "",
  honorific: "",
  title: "",
  photo_url: "",
  languages: [],
  years_experience: null,
  specialties: [],
  certifications: [],
  lineage: "",
  tagline: "",
  short_bio: "",
  long_bio: "",
  quote: "",
  philosophy: "",
  email: "",
  phone: "",
  whatsapp: "",
  website_url: "",
  instagram_url: "",
  youtube_url: "",
  linkedin_url: "",
  is_active: true,
  is_featured: false,
  display_order: 0,
});

function csv(arr: string[]) { return arr.join(", "); }
function parseCsv(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function EditAstrologer() {
  const { id: idParam } = Route.useParams();
  const isNew = idParam === "new";
  const navigate = useNavigate();
  const get = useServerFn(getAstrologerAdmin);
  const upsert = useServerFn(upsertAstrologer);
  const upService = useServerFn(upsertService);
  const delService = useServerFn(deleteService);
  const upAvail = useServerFn(upsertAvailability);
  const delAvail = useServerFn(deleteAvailability);

  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(blankProfile());
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [tab, setTab] = useState<"profile" | "services" | "availability">("profile");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = getAdminToken();
    if (!t) { void navigate({ to: "/admin" }); return; }
    setToken(t);
  }, [navigate]);

  const load = useCallback(async (t: string) => {
    if (isNew) return;
    try {
      const res = await get({ data: { adminToken: t, id: idParam } });
      setProfile(res.profile as Profile);
      setServices((res.services ?? []) as Service[]);
      setAvailability((res.availability ?? []) as Availability[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    }
  }, [get, idParam, isNew]);

  useEffect(() => { if (token) void load(token); }, [token, load]);

  async function saveProfile() {
    if (!token) return;
    setSaving(true);
    try {
      const res = await upsert({ data: { adminToken: token, data: profile } });
      toast.success("Saved");
      if (isNew && res.id) void navigate({ to: "/admin/astrologers/$id", params: { id: res.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof Profile>(k: K, v: Profile[K]) {
    setProfile((p) => ({ ...p, [k]: v }));
  }

  // -------- Services --------
  function addService() {
    if (!profile.id) { toast.error("Save profile first"); return; }
    setServices((s) => [...s, {
      astrologer_id: profile.id!,
      name: "",
      description: "",
      duration_minutes: 60,
      price_amount: 0,
      price_currency: "INR",
      modes: [],
      display_order: s.length,
      is_active: true,
    }]);
  }
  async function saveService(i: number) {
    if (!token) return;
    try {
      const res = await upService({ data: { adminToken: token, data: services[i] } });
      setServices((s) => s.map((x, idx) => idx === i ? { ...x, id: res.id ?? x.id } : x));
      toast.success("Service saved");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  }
  async function removeService(i: number) {
    if (!token) return;
    const s = services[i];
    if (s.id) {
      try { await delService({ data: { adminToken: token, id: s.id } }); }
      catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); return; }
    }
    setServices((arr) => arr.filter((_, idx) => idx !== i));
  }
  function updateService(i: number, patch: Partial<Service>) {
    setServices((s) => s.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  }

  // -------- Availability --------
  function addAvail() {
    if (!profile.id) { toast.error("Save profile first"); return; }
    setAvailability((a) => [...a, {
      astrologer_id: profile.id!,
      timezone: "Asia/Kolkata",
      day_of_week: 1,
      start_time: "10:00",
      end_time: "18:00",
    }]);
  }
  async function saveAvail(i: number) {
    if (!token) return;
    try {
      const res = await upAvail({ data: { adminToken: token, data: availability[i] } });
      setAvailability((a) => a.map((x, idx) => idx === i ? { ...x, id: res.id ?? x.id } : x));
      toast.success("Slot saved");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  }
  async function removeAvail(i: number) {
    if (!token) return;
    const a = availability[i];
    if (a.id) {
      try { await delAvail({ data: { adminToken: token, id: a.id } }); }
      catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); return; }
    }
    setAvailability((arr) => arr.filter((_, idx) => idx !== i));
  }
  function updateAvail(i: number, patch: Partial<Availability>) {
    setAvailability((a) => a.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-10">
        <nav className="flex items-center gap-6 mb-8 pb-4 border-b border-[var(--gold)]/15">
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-[var(--gold)]">Consultations</Link>
          <Link to="/admin/astrologers" className="text-sm text-[var(--gold)] font-medium">Astrologers</Link>
          <button
            onClick={() => { clearAdminToken(); window.location.href = "/admin"; }}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >Lock</button>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin/astrologers" className="text-xs text-muted-foreground hover:text-[var(--gold)]">← Back to list</Link>
            <h1 className="font-display text-3xl text-[var(--gold)] mt-2">
              {isNew ? "New Astrologer" : profile.full_name || "Edit Astrologer"}
            </h1>
            {profile.slug && <p className="text-xs text-muted-foreground mt-1">/{profile.slug}</p>}
          </div>
          <div className="flex gap-2">
            {profile.slug && !isNew && (
              <Link
                to="/astrologer/$slug"
                params={{ slug: profile.slug }}
                target="_blank"
                className="text-sm h-9 px-4 inline-flex items-center rounded-md border border-input hover:bg-accent"
              >View public ↗</Link>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-[var(--gold)]/15">
          {(["profile", "services", "availability"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize border-b-2 -mb-px transition-colors ${
                tab === t ? "border-[var(--gold)] text-[var(--gold)]" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >{t}</button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="space-y-8">
            <Section title="Identity">
              <Grid>
                <FieldEl label="Full name *">
                  <Input value={profile.full_name} onChange={(e) => updateField("full_name", e.target.value)} />
                </FieldEl>
                <FieldEl label="Honorific (Acharya, Pandit…)">
                  <Input value={profile.honorific ?? ""} onChange={(e) => updateField("honorific", e.target.value)} />
                </FieldEl>
                <FieldEl label="Title">
                  <Input value={profile.title ?? ""} onChange={(e) => updateField("title", e.target.value)} />
                </FieldEl>
                <FieldEl label="Slug (leave blank to auto)">
                  <Input value={profile.slug ?? ""} onChange={(e) => updateField("slug", e.target.value)} />
                </FieldEl>
                <FieldEl label="Photo URL" className="md:col-span-2">
                  <Input value={profile.photo_url ?? ""} onChange={(e) => updateField("photo_url", e.target.value)} placeholder="https://…" />
                </FieldEl>
                <FieldEl label="Languages (comma-separated)" className="md:col-span-2">
                  <Input value={csv(profile.languages)} onChange={(e) => updateField("languages", parseCsv(e.target.value))} placeholder="English, Hindi, Sanskrit" />
                </FieldEl>
              </Grid>
            </Section>

            <Section title="Credentials">
              <Grid>
                <FieldEl label="Years of experience">
                  <Input type="number" min={0} value={profile.years_experience ?? ""} onChange={(e) => updateField("years_experience", e.target.value === "" ? null : Number(e.target.value))} />
                </FieldEl>
                <FieldEl label="Lineage / Guru">
                  <Input value={profile.lineage ?? ""} onChange={(e) => updateField("lineage", e.target.value)} />
                </FieldEl>
                <FieldEl label="Specialties (comma-separated)" className="md:col-span-2">
                  <Input value={csv(profile.specialties)} onChange={(e) => updateField("specialties", parseCsv(e.target.value))} placeholder="Vedic, Vastu, Numerology" />
                </FieldEl>
                <FieldEl label="Certifications (comma-separated)" className="md:col-span-2">
                  <Input value={csv(profile.certifications)} onChange={(e) => updateField("certifications", parseCsv(e.target.value))} />
                </FieldEl>
              </Grid>
            </Section>

            <Section title="Bio & Philosophy">
              <Grid>
                <FieldEl label="Tagline" className="md:col-span-2">
                  <Input value={profile.tagline ?? ""} onChange={(e) => updateField("tagline", e.target.value)} />
                </FieldEl>
                <FieldEl label="Short bio (listing)" className="md:col-span-2">
                  <Textarea rows={3} value={profile.short_bio ?? ""} onChange={(e) => updateField("short_bio", e.target.value)} />
                </FieldEl>
                <FieldEl label="Long bio (profile page)" className="md:col-span-2">
                  <Textarea rows={8} value={profile.long_bio ?? ""} onChange={(e) => updateField("long_bio", e.target.value)} />
                </FieldEl>
                <FieldEl label="Quote">
                  <Textarea rows={2} value={profile.quote ?? ""} onChange={(e) => updateField("quote", e.target.value)} />
                </FieldEl>
                <FieldEl label="Philosophy">
                  <Textarea rows={2} value={profile.philosophy ?? ""} onChange={(e) => updateField("philosophy", e.target.value)} />
                </FieldEl>
              </Grid>
            </Section>

            <Section title="Contact & Social">
              <Grid>
                <FieldEl label="Email"><Input value={profile.email ?? ""} onChange={(e) => updateField("email", e.target.value)} /></FieldEl>
                <FieldEl label="Phone"><Input value={profile.phone ?? ""} onChange={(e) => updateField("phone", e.target.value)} /></FieldEl>
                <FieldEl label="WhatsApp"><Input value={profile.whatsapp ?? ""} onChange={(e) => updateField("whatsapp", e.target.value)} /></FieldEl>
                <FieldEl label="Website"><Input value={profile.website_url ?? ""} onChange={(e) => updateField("website_url", e.target.value)} /></FieldEl>
                <FieldEl label="Instagram"><Input value={profile.instagram_url ?? ""} onChange={(e) => updateField("instagram_url", e.target.value)} /></FieldEl>
                <FieldEl label="YouTube"><Input value={profile.youtube_url ?? ""} onChange={(e) => updateField("youtube_url", e.target.value)} /></FieldEl>
                <FieldEl label="LinkedIn" className="md:col-span-2"><Input value={profile.linkedin_url ?? ""} onChange={(e) => updateField("linkedin_url", e.target.value)} /></FieldEl>
              </Grid>
            </Section>

            <Section title="Display">
              <Grid>
                <FieldEl label="Display order">
                  <Input type="number" value={profile.display_order} onChange={(e) => updateField("display_order", Number(e.target.value || 0))} />
                </FieldEl>
                <FieldEl label="">
                  <div className="flex items-center gap-6 h-9">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={profile.is_active} onChange={(e) => updateField("is_active", e.target.checked)} />
                      Active (shown publicly)
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={profile.is_featured} onChange={(e) => updateField("is_featured", e.target.checked)} />
                      Featured
                    </label>
                  </div>
                </FieldEl>
              </Grid>
            </Section>

            <div className="flex justify-end gap-2 sticky bottom-0 bg-[var(--background)] py-4 border-t border-[var(--gold)]/15">
              <Button onClick={saveProfile} disabled={saving || !profile.full_name.trim()}>
                {saving ? "Saving…" : isNew ? "Create" : "Save changes"}
              </Button>
            </div>
          </div>
        )}

        {tab === "services" && (
          <div className="space-y-4">
            {!profile.id && <p className="text-sm text-muted-foreground">Save the profile first to add services.</p>}
            {services.map((s, i) => (
              <div key={i} className="border border-[var(--gold)]/15 rounded-lg p-5 space-y-3">
                <Grid>
                  <FieldEl label="Service name *" className="md:col-span-2">
                    <Input value={s.name} onChange={(e) => updateService(i, { name: e.target.value })} />
                  </FieldEl>
                  <FieldEl label="Description" className="md:col-span-2">
                    <Textarea rows={2} value={s.description ?? ""} onChange={(e) => updateService(i, { description: e.target.value })} />
                  </FieldEl>
                  <FieldEl label="Duration (min)">
                    <Input type="number" value={s.duration_minutes ?? ""} onChange={(e) => updateService(i, { duration_minutes: e.target.value === "" ? null : Number(e.target.value) })} />
                  </FieldEl>
                  <FieldEl label="Price">
                    <div className="flex gap-2">
                      <Input type="number" value={s.price_amount ?? ""} onChange={(e) => updateService(i, { price_amount: e.target.value === "" ? null : Number(e.target.value) })} />
                      <Input className="w-20" value={s.price_currency} onChange={(e) => updateService(i, { price_currency: e.target.value })} />
                    </div>
                  </FieldEl>
                  <FieldEl label="Modes" className="md:col-span-2">
                    <div className="flex gap-4">
                      {MODES.map((m) => (
                        <label key={m} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={s.modes.includes(m)}
                            onChange={(e) => updateService(i, {
                              modes: e.target.checked ? [...s.modes, m] : s.modes.filter((x) => x !== m),
                            })}
                          />
                          {m.replace("_", " ")}
                        </label>
                      ))}
                    </div>
                  </FieldEl>
                  <FieldEl label="Order">
                    <Input type="number" value={s.display_order} onChange={(e) => updateService(i, { display_order: Number(e.target.value || 0) })} />
                  </FieldEl>
                  <FieldEl label="">
                    <label className="flex items-center gap-2 text-sm h-9">
                      <input type="checkbox" checked={s.is_active} onChange={(e) => updateService(i, { is_active: e.target.checked })} />
                      Active
                    </label>
                  </FieldEl>
                </Grid>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => removeService(i)}>Remove</Button>
                  <Button onClick={() => saveService(i)} disabled={!s.name.trim()}>Save</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addService} disabled={!profile.id}>+ Add service</Button>
          </div>
        )}

        {tab === "availability" && (
          <div className="space-y-4">
            {!profile.id && <p className="text-sm text-muted-foreground">Save the profile first to add availability.</p>}
            {availability.map((a, i) => (
              <div key={i} className="border border-[var(--gold)]/15 rounded-lg p-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <FieldEl label="Day">
                  <select value={a.day_of_week} onChange={(e) => updateAvail(i, { day_of_week: Number(e.target.value) })} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                    {DAYS.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
                  </select>
                </FieldEl>
                <FieldEl label="Start">
                  <Input type="time" value={a.start_time.slice(0, 5)} onChange={(e) => updateAvail(i, { start_time: e.target.value })} />
                </FieldEl>
                <FieldEl label="End">
                  <Input type="time" value={a.end_time.slice(0, 5)} onChange={(e) => updateAvail(i, { end_time: e.target.value })} />
                </FieldEl>
                <FieldEl label="Timezone">
                  <Input value={a.timezone} onChange={(e) => updateAvail(i, { timezone: e.target.value })} />
                </FieldEl>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => removeAvail(i)}>Remove</Button>
                  <Button onClick={() => saveAvail(i)}>Save</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addAvail} disabled={!profile.id}>+ Add slot</Button>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-[var(--gold)]/15 rounded-lg p-6">
      <h2 className="font-display text-lg text-[var(--gold)] mb-4">{title}</h2>
      {children}
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
function FieldEl({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>}
      {children}
    </div>
  );
}
