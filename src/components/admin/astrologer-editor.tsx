import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FormField, ValidatedInput, ValidatedTextarea } from "@/components/admin/form-field";
import { TagInput } from "@/components/admin/tag-input";
import { useAdmin } from "@/components/admin/admin-shell";
import {
  hasErrors, validateProfileFields, type ProfileFieldErrors,
  isValidUrl,
} from "@/lib/form-validation";
import {
  getAstrologerAdmin, upsertAstrologer,
  upsertService, deleteService,
  upsertAvailability, deleteAvailability,
} from "@/lib/astrologers.functions";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MODES = [
  { id: "in_person" as const, label: "In person" },
  { id: "video" as const, label: "Video" },
  { id: "phone" as const, label: "Phone" },
];
const CURRENCIES = ["INR", "USD", "GBP", "EUR"];

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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatMode(m: string) {
  return MODES.find((x) => x.id === m)?.label ?? m.replace("_", " ");
}

export function AstrologerEditor({ id: idParam, initialTab }: { id: string; initialTab?: "profile" | "services" | "availability" }) {
  const isNew = idParam === "new";
  const navigate = useNavigate();
  const { token } = useAdmin();
  const get = useServerFn(getAstrologerAdmin);
  const upsert = useServerFn(upsertAstrologer);
  const upService = useServerFn(upsertService);
  const delService = useServerFn(deleteService);
  const upAvail = useServerFn(upsertAvailability);
  const delAvail = useServerFn(deleteAvailability);

  const [profile, setProfile] = useState<Profile>(blankProfile());
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [tab, setTab] = useState(initialTab ?? "profile");
  const [loading, setLoading] = useState(!isNew);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingServices, setSavingServices] = useState(false);
  const [savingAvail, setSavingAvail] = useState(false);
  const [errors, setErrors] = useState<ProfileFieldErrors>({});

  const profileReady = !!profile.id;
  const slugPreview = profile.slug?.trim() || slugify(profile.full_name) || "auto-generated-on-save";

  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const res = await get({ data: { adminToken: token, id: idParam } });
      setProfile(res.profile as Profile);
      setServices((res.services ?? []) as Service[]);
      setAvailability((res.availability ?? []) as Availability[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [get, idParam, isNew, token]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  function updateField<K extends keyof Profile>(k: K, v: Profile[K]) {
    setProfile((p) => ({ ...p, [k]: v }));
    if (k in errors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[k as keyof ProfileFieldErrors];
        return next;
      });
    }
  }

  function touchField(field: keyof ProfileFieldErrors) {
    const next = validateProfileFields(profile);
    setErrors((prev) => {
      const updated = { ...prev };
      if (next[field]) updated[field] = next[field];
      else delete updated[field];
      return updated;
    });
  }

  async function saveProfile(andGoTo?: "services" | "availability") {
    const validation = validateProfileFields(profile);
    if (hasErrors(validation)) {
      setErrors(validation);
      toast.error("Please fix the highlighted fields");
      setTab("profile");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await upsert({ data: { adminToken: token, data: profile } });
      toast.success(isNew ? "Profile created" : "Profile saved");
      setErrors({});
      if (isNew && res.id) {
        void navigate({
          to: "/admin/astrologers/$id",
          params: { id: res.id },
          search: andGoTo ? { tab: andGoTo } : undefined,
        });
      } else {
        void load();
        if (andGoTo) setTab(andGoTo);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  function requireProfile(action: string): boolean {
    if (profileReady) return true;
    toast.error(`Save the profile first to ${action}`);
    setTab("profile");
    return false;
  }

  // -------- Services --------
  function addService() {
    if (!requireProfile("add services")) return;
    setServices((s) => [...s, {
      astrologer_id: profile.id!,
      name: "",
      description: "",
      duration_minutes: 60,
      price_amount: null,
      price_currency: "INR",
      modes: ["video"],
      display_order: s.length,
      is_active: true,
    }]);
  }

  function duplicateService(i: number) {
    const src = services[i];
    if (!src) return;
    setServices((s) => [...s, {
      ...src,
      id: undefined,
      name: `${src.name} (copy)`,
      display_order: s.length,
    }]);
  }

  async function saveService(i: number) {
    const s = services[i];
    if (!s.name.trim()) {
      toast.error("Service name is required");
      return;
    }
    try {
      const res = await upService({ data: { adminToken: token, data: s } });
      setServices((list) => list.map((x, idx) => idx === i ? { ...x, id: res.id ?? x.id } : x));
      toast.success(`Saved "${s.name}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save service");
    }
  }

  async function saveAllServices() {
    const invalid = services.findIndex((s) => !s.name.trim());
    if (invalid >= 0) {
      toast.error(`Service #${invalid + 1} needs a name`);
      return;
    }
    if (services.length === 0) return;
    setSavingServices(true);
    try {
      const saved = await Promise.all(
        services.map((s) => upService({ data: { adminToken: token, data: s } })),
      );
      setServices((list) => list.map((s, i) => ({ ...s, id: saved[i]?.id ?? s.id })));
      toast.success(`Saved ${services.length} service${services.length === 1 ? "" : "s"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save services");
    } finally {
      setSavingServices(false);
    }
  }

  async function removeService(i: number) {
    const s = services[i];
    if (s.id && !window.confirm(`Delete service "${s.name}"?`)) return;
    if (s.id) {
      try { await delService({ data: { adminToken: token, id: s.id } }); }
      catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); return; }
    }
    setServices((arr) => arr.filter((_, idx) => idx !== i));
    toast.success("Service removed");
  }

  function updateService(i: number, patch: Partial<Service>) {
    setServices((s) => s.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  }

  const unsavedServices = useMemo(
    () => services.filter((s) => !s.id).length,
    [services],
  );

  // -------- Availability --------
  function addAvail(day?: number) {
    if (!requireProfile("add availability")) return;
    setAvailability((a) => [...a, {
      astrologer_id: profile.id!,
      timezone: "Asia/Kolkata",
      day_of_week: day ?? 1,
      start_time: "10:00",
      end_time: "18:00",
    }]);
  }

  function addWeekdaySlots() {
    if (!requireProfile("add availability")) return;
    setAvailability((a) => [
      ...a,
      ...([1, 2, 3, 4, 5] as const).map((day) => ({
        astrologer_id: profile.id!,
        timezone: "Asia/Kolkata",
        day_of_week: day,
        start_time: "10:00",
        end_time: "18:00",
      })),
    ]);
    toast.success("Added Mon–Fri slots (save when ready)");
  }

  async function saveAvail(i: number) {
    const slot = availability[i];
    if (slot.start_time >= slot.end_time) {
      toast.error("End time must be after start time");
      return;
    }
    try {
      const res = await upAvail({ data: { adminToken: token, data: slot } });
      setAvailability((a) => a.map((x, idx) => idx === i ? { ...x, id: res.id ?? x.id } : x));
      toast.success(`Saved ${DAYS[slot.day_of_week]} slot`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save slot");
    }
  }

  async function saveAllAvail() {
    if (availability.length === 0) return;
    const bad = availability.findIndex((a) => a.start_time >= a.end_time);
    if (bad >= 0) {
      toast.error(`Slot #${bad + 1}: end time must be after start`);
      return;
    }
    setSavingAvail(true);
    try {
      const saved = await Promise.all(
        availability.map((a) => upAvail({ data: { adminToken: token, data: a } })),
      );
      setAvailability((list) => list.map((a, i) => ({ ...a, id: saved[i]?.id ?? a.id })));
      toast.success(`Saved ${availability.length} slot${availability.length === 1 ? "" : "s"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save availability");
    } finally {
      setSavingAvail(false);
    }
  }

  async function removeAvail(i: number) {
    const a = availability[i];
    if (a.id && !window.confirm(`Delete ${DAYS[a.day_of_week]} slot?`)) return;
    if (a.id) {
      try { await delAvail({ data: { adminToken: token, id: a.id } }); }
      catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); return; }
    }
    setAvailability((arr) => arr.filter((_, idx) => idx !== i));
  }

  function updateAvail(i: number, patch: Partial<Availability>) {
    setAvailability((a) => a.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  }

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <Link to="/admin/astrologers" className="text-xs text-muted-foreground hover:text-[var(--gold)]">
            ← Back to astrologers
          </Link>
          <h1 className="font-display text-3xl text-[var(--gold)] mt-2">
            {isNew ? "New astrologer" : profile.full_name || "Edit astrologer"}
          </h1>
          {!isNew && profile.slug && (
            <p className="text-xs text-muted-foreground mt-1">
              Public URL:{" "}
              <Link to="/astrologer/$slug" params={{ slug: profile.slug }} className="text-[var(--gold)] hover:underline" target="_blank">
                /astrologer/{profile.slug}
              </Link>
            </p>
          )}
          {isNew && (
            <p className="text-sm text-muted-foreground mt-1">
              Step 1: fill in profile details and create. Then add services and availability.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.slug && profile.is_active && !isNew && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/astrologer/$slug" params={{ slug: profile.slug }} target="_blank">
                Preview public page ↗
              </Link>
            </Button>
          )}
        </div>
      </div>

      {!profileReady && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900">
          Save the profile first to unlock <strong>Services</strong> and <strong>Availability</strong> tabs.
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as "profile" | "services" | "availability")}>
        <TabsList className="mb-6 h-auto flex-wrap gap-1 bg-muted/50 p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="services" disabled={!profileReady}>
            Services {services.length > 0 && `(${services.length})`}
          </TabsTrigger>
          <TabsTrigger value="availability" disabled={!profileReady}>
            Availability {availability.length > 0 && `(${availability.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8 mt-0">
          <EditorSection title="Identity" description="Basic info shown on the council section and profile page.">
            <FieldGrid>
              <FormField label="Full name *" error={errors.full_name}>
                <ValidatedInput
                  value={profile.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  onBlur={() => touchField("full_name")}
                  placeholder="Pradeep Bhanot"
                  error={errors.full_name}
                />
              </FormField>
              <FormField label="Honorific">
                <ValidatedInput
                  value={profile.honorific ?? ""}
                  onChange={(e) => updateField("honorific", e.target.value)}
                  placeholder="Acharya, Pandit…"
                />
              </FormField>
              <FormField label="Title / role">
                <ValidatedInput
                  value={profile.title ?? ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Vedic Astrologer"
                />
              </FormField>
              <FormField label="URL slug" error={errors.slug} hint={!errors.slug ? `Preview: /astrologer/${slugPreview}` : undefined}>
                <ValidatedInput
                  value={profile.slug ?? ""}
                  onChange={(e) => updateField("slug", e.target.value.toLowerCase())}
                  onBlur={() => touchField("slug")}
                  placeholder="Leave blank to auto-generate"
                  error={errors.slug}
                />
              </FormField>
              <FormField label="Photo URL" error={errors.photo_url} className="md:col-span-2">
                <ValidatedInput
                  value={profile.photo_url ?? ""}
                  onChange={(e) => updateField("photo_url", e.target.value)}
                  onBlur={() => touchField("photo_url")}
                  placeholder="https://…"
                  error={errors.photo_url}
                />
                {profile.photo_url?.trim() && !errors.photo_url && isValidUrl(profile.photo_url) && (
                  <img
                    src={profile.photo_url}
                    alt="Preview"
                    className="mt-3 w-24 h-24 rounded-lg object-cover border border-[var(--gold)]/30"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </FormField>
              <FormField label="Languages" className="md:col-span-2">
                <TagInput
                  value={profile.languages}
                  onChange={(tags) => updateField("languages", tags)}
                  placeholder="English"
                />
              </FormField>
            </FieldGrid>
          </EditorSection>

          <EditorSection title="Credentials">
            <FieldGrid>
              <FormField label="Years of experience" error={errors.years_experience}>
                <ValidatedInput
                  type="number"
                  min={0}
                  max={120}
                  value={profile.years_experience ?? ""}
                  onChange={(e) => updateField("years_experience", e.target.value === "" ? null : Number(e.target.value))}
                  onBlur={() => touchField("years_experience")}
                  error={errors.years_experience}
                />
              </FormField>
              <FormField label="Lineage / Guru">
                <ValidatedInput value={profile.lineage ?? ""} onChange={(e) => updateField("lineage", e.target.value)} />
              </FormField>
              <FormField label="Specialties" className="md:col-span-2">
                <TagInput
                  value={profile.specialties}
                  onChange={(tags) => updateField("specialties", tags)}
                  placeholder="Vedic Astrology"
                />
              </FormField>
              <FormField label="Certifications" className="md:col-span-2">
                <TagInput
                  value={profile.certifications}
                  onChange={(tags) => updateField("certifications", tags)}
                  placeholder="Jyotish Acharya"
                />
              </FormField>
            </FieldGrid>
          </EditorSection>

          <EditorSection title="Bio & philosophy">
            <FieldGrid>
              <FormField label="Tagline" className="md:col-span-2">
                <ValidatedInput value={profile.tagline ?? ""} onChange={(e) => updateField("tagline", e.target.value)} placeholder="One-line hook for listings" />
              </FormField>
              <FormField label="Short bio" hint="Council cards & listings" className="md:col-span-2">
                <ValidatedTextarea rows={3} value={profile.short_bio ?? ""} onChange={(e) => updateField("short_bio", e.target.value)} />
              </FormField>
              <FormField label="Long bio" hint="Full profile page" className="md:col-span-2">
                <ValidatedTextarea rows={8} value={profile.long_bio ?? ""} onChange={(e) => updateField("long_bio", e.target.value)} />
              </FormField>
              <FormField label="Quote">
                <ValidatedTextarea rows={2} value={profile.quote ?? ""} onChange={(e) => updateField("quote", e.target.value)} />
              </FormField>
              <FormField label="Philosophy">
                <ValidatedTextarea rows={2} value={profile.philosophy ?? ""} onChange={(e) => updateField("philosophy", e.target.value)} />
              </FormField>
            </FieldGrid>
          </EditorSection>

          <EditorSection title="Contact & social">
            <FieldGrid>
              <FormField label="Email" error={errors.email}>
                <ValidatedInput
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={profile.email ?? ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={() => touchField("email")}
                  placeholder="name@example.com"
                  error={errors.email}
                />
              </FormField>
              <FormField label="Phone" error={errors.phone}>
                <ValidatedInput
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={profile.phone ?? ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  onBlur={() => touchField("phone")}
                  placeholder="+91 98765 43210"
                  error={errors.phone}
                />
              </FormField>
              <FormField label="WhatsApp" error={errors.whatsapp}>
                <ValidatedInput
                  type="tel"
                  inputMode="tel"
                  value={profile.whatsapp ?? ""}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  onBlur={() => touchField("whatsapp")}
                  placeholder="+91 98765 43210"
                  error={errors.whatsapp}
                />
              </FormField>
              <FormField label="Website" error={errors.website_url}>
                <ValidatedInput
                  type="url"
                  value={profile.website_url ?? ""}
                  onChange={(e) => updateField("website_url", e.target.value)}
                  onBlur={() => touchField("website_url")}
                  placeholder="https://…"
                  error={errors.website_url}
                />
              </FormField>
              <FormField label="Instagram" error={errors.instagram_url}>
                <ValidatedInput
                  type="url"
                  value={profile.instagram_url ?? ""}
                  onChange={(e) => updateField("instagram_url", e.target.value)}
                  onBlur={() => touchField("instagram_url")}
                  placeholder="https://instagram.com/…"
                  error={errors.instagram_url}
                />
              </FormField>
              <FormField label="YouTube" error={errors.youtube_url}>
                <ValidatedInput
                  type="url"
                  value={profile.youtube_url ?? ""}
                  onChange={(e) => updateField("youtube_url", e.target.value)}
                  onBlur={() => touchField("youtube_url")}
                  placeholder="https://youtube.com/…"
                  error={errors.youtube_url}
                />
              </FormField>
              <FormField label="LinkedIn" error={errors.linkedin_url} className="md:col-span-2">
                <ValidatedInput
                  type="url"
                  value={profile.linkedin_url ?? ""}
                  onChange={(e) => updateField("linkedin_url", e.target.value)}
                  onBlur={() => touchField("linkedin_url")}
                  placeholder="https://linkedin.com/in/…"
                  error={errors.linkedin_url}
                />
              </FormField>
            </FieldGrid>
          </EditorSection>

          <EditorSection title="Visibility">
            <FieldGrid>
              <FormField label="Display order" hint="Lower numbers appear first">
                <ValidatedInput type="number" value={profile.display_order} onChange={(e) => updateField("display_order", Number(e.target.value || 0))} />
              </FormField>
              <div className="flex flex-col gap-4 justify-center">
                <ToggleRow
                  label="Active"
                  hint="Visible on homepage and public profile"
                  checked={profile.is_active}
                  onCheckedChange={(v) => updateField("is_active", v)}
                />
                <ToggleRow
                  label="Featured"
                  hint="Large hero card on council section"
                  checked={profile.is_featured}
                  onCheckedChange={(v) => updateField("is_featured", v)}
                />
              </div>
            </FieldGrid>
          </EditorSection>

          <div className="flex flex-wrap justify-end gap-2 sticky bottom-0 bg-[var(--background)]/95 backdrop-blur py-4 border-t border-[var(--gold)]/15">
            {!isNew && profileReady && (
              <Button variant="outline" onClick={() => void saveProfile("services")} disabled={savingProfile}>
                Save & add services
              </Button>
            )}
            <Button onClick={() => void saveProfile()} disabled={savingProfile || !profile.full_name.trim()}>
              {savingProfile ? "Saving…" : isNew ? "Create profile" : "Save profile"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4 mt-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-[var(--gold)]">Services</h2>
              <p className="text-sm text-muted-foreground">Consultation offerings shown on the public profile.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {services.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => void saveAllServices()} disabled={savingServices}>
                  {savingServices ? "Saving all…" : "Save all"}
                </Button>
              )}
              <Button size="sm" onClick={addService}>+ Add service</Button>
            </div>
          </div>

          {unsavedServices > 0 && (
            <p className="text-xs text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
              {unsavedServices} unsaved draft{unsavedServices === 1 ? "" : "s"} — click Save on each or use Save all.
            </p>
          )}

          {services.length === 0 ? (
            <EmptyPanel
              title="No services yet"
              body="Add consultation types like Birth Chart Reading, Vastu Audit, or Career Guidance."
              action={<Button onClick={addService}>+ Add first service</Button>}
            />
          ) : (
            services.map((s, i) => (
              <div key={s.id ?? `draft-${i}`} className="border border-[var(--gold)]/15 rounded-xl p-5 space-y-4 bg-card/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{s.name.trim() || `Service ${i + 1}`}</h3>
                    {!s.id && <span className="text-xs text-amber-700">Draft — not saved</span>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => duplicateService(i)} title="Duplicate">Copy</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => void removeService(i)}>Remove</Button>
                  </div>
                </div>

                <FieldGrid>
                  <FormField label="Service name *" className="md:col-span-2">
                    <ValidatedInput value={s.name} onChange={(e) => updateService(i, { name: e.target.value })} placeholder="Birth Chart Reading" />
                  </FormField>
                  <FormField label="Description" className="md:col-span-2">
                    <ValidatedTextarea rows={2} value={s.description ?? ""} onChange={(e) => updateService(i, { description: e.target.value })} />
                  </FormField>
                  <FormField label="Duration (minutes)">
                    <ValidatedInput
                      type="number"
                      min={0}
                      value={s.duration_minutes ?? ""}
                      onChange={(e) => updateService(i, { duration_minutes: e.target.value === "" ? null : Number(e.target.value) })}
                    />
                  </FormField>
                  <FormField label="Price">
                    <div className="flex gap-2">
                      <ValidatedInput
                        type="number"
                        min={0}
                        className="flex-1"
                        value={s.price_amount ?? ""}
                        onChange={(e) => updateService(i, { price_amount: e.target.value === "" ? null : Number(e.target.value) })}
                        placeholder="Amount"
                      />
                      <Select value={s.price_currency} onValueChange={(v) => updateService(i, { price_currency: v })}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormField>
                  <FormField label="Delivery modes" className="md:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {MODES.map((m) => {
                        const on = s.modes.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => updateService(i, {
                              modes: on ? s.modes.filter((x) => x !== m.id) : [...s.modes, m.id],
                            })}
                            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                              on
                                ? "bg-[var(--gold)]/15 border-[var(--gold)]/40 text-[var(--gold)]"
                                : "border-border text-muted-foreground hover:border-[var(--gold)]/30"
                            }`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </FormField>
                  <FormField label="Sort order">
                    <ValidatedInput type="number" value={s.display_order} onChange={(e) => updateService(i, { display_order: Number(e.target.value || 0) })} />
                  </FormField>
                  <div className="flex items-end pb-1">
                    <ToggleRow label="Active on profile" checked={s.is_active} onCheckedChange={(v) => updateService(i, { is_active: v })} />
                  </div>
                </FieldGrid>

                <div className="flex justify-end">
                  <Button size="sm" onClick={() => void saveService(i)} disabled={!s.name.trim()}>
                    Save service
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="availability" className="space-y-4 mt-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-[var(--gold)]">Availability</h2>
              <p className="text-sm text-muted-foreground">Weekly hours shown on the public profile.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {availability.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => void saveAllAvail()} disabled={savingAvail}>
                  {savingAvail ? "Saving all…" : "Save all"}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={addWeekdaySlots}>+ Mon–Fri template</Button>
              <Button size="sm" onClick={() => addAvail()}>+ Add slot</Button>
            </div>
          </div>

          {availability.length === 0 ? (
            <EmptyPanel
              title="No availability set"
              body="Add individual slots or use the Mon–Fri template to get started quickly."
              action={
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={addWeekdaySlots}>+ Mon–Fri template</Button>
                  <Button onClick={() => addAvail()}>+ Add slot</Button>
                </div>
              }
            />
          ) : (
            availability.map((a, i) => (
              <div key={a.id ?? `slot-${i}`} className="border border-[var(--gold)]/15 rounded-xl p-5 bg-card/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <FormField label="Day">
                    <Select value={String(a.day_of_week)} onValueChange={(v) => updateAvail(i, { day_of_week: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d, idx) => <SelectItem key={d} value={String(idx)}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Start">
                    <ValidatedInput type="time" value={a.start_time.slice(0, 5)} onChange={(e) => updateAvail(i, { start_time: e.target.value })} />
                  </FormField>
                  <FormField label="End">
                    <ValidatedInput type="time" value={a.end_time.slice(0, 5)} onChange={(e) => updateAvail(i, { end_time: e.target.value })} />
                  </FormField>
                  <FormField label="Timezone">
                    <ValidatedInput value={a.timezone} onChange={(e) => updateAvail(i, { timezone: e.target.value })} />
                  </FormField>
                  <div className="flex gap-2 justify-end lg:justify-start">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => void removeAvail(i)}>Remove</Button>
                    <Button size="sm" onClick={() => void saveAvail(i)}>Save</Button>
                  </div>
                </div>
                {!a.id && <p className="text-xs text-amber-700 mt-2">Draft — not saved</p>}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EditorSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="border border-[var(--gold)]/15 rounded-xl p-6 bg-card/20">
      <h2 className="font-display text-lg text-[var(--gold)]">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </section>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function ToggleRow({ label, hint, checked, onCheckedChange }: { label: string; hint?: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function EmptyPanel({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="border border-dashed border-[var(--gold)]/25 rounded-xl p-12 text-center">
      <p className="font-display text-xl text-foreground/80">{title}</p>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{body}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

export { formatMode };
