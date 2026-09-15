import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListTeamMembersQueryKey,
  useCreateTeamMember,
  useDeleteTeamMember,
  useListTeamMembers,
  useUpdateTeamMember,
  type TeamMember,
  type TeamMemberInput,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import { ImagePlus, KeyRound, Loader2, Pencil, Plus, ShieldCheck, Trash2, Upload, X } from "lucide-react";

type Draft = {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  parentId: string;
  level: "director" | "lead" | "team";
  accent: "teal" | "gold" | "navy";
  sortOrder: number;
  imagePreview?: string | null;
  removeImage?: boolean;
};

const emptyDraft: Draft = {
  name: "",
  title: "",
  bio: "",
  email: "",
  phone: "",
  parentId: "none",
  level: "team",
  accent: "teal",
  sortOrder: 0,
  imagePreview: null,
};

function initialsFor(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]?.toUpperCase()).join("") || "??";
}

function TeamPhoto({ image, name, large = false }: { image?: string | null; name: string; large?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const size = large ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm";
  if (image && !imageFailed) {
    return (
      <img
        src={image}
        alt={`${name} profile`}
        onError={() => setImageFailed(true)}
        className={`${large ? "h-16 w-16" : "h-12 w-12"} shrink-0 rounded-full object-cover ring-4 ring-primary/10`}
      />
    );
  }
  return (
    <div className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary ring-4 ring-primary/5`}>
      {initialsFor(name)}
    </div>
  );
}

async function uploadProfilePhoto(file: File): Promise<string> {
  const request = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!request.ok) throw new Error("Could not prepare the photo upload.");
  const { uploadURL, objectPath } = await request.json() as { uploadURL: string; objectPath: string };
  const upload = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!upload.ok) throw new Error("The profile photo upload failed.");
  return objectPath;
}

export default function AdminTeam() {
  const queryClient = useQueryClient();
  const { isFullAccess, isLoaded: roleLoaded } = useRole();
  const { data: people = [], isLoading, isError } = useListTeamMembers();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();
  const [editing, setEditing] = useState<TeamMember | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [accountDraft, setAccountDraft] = useState({ email: "", password: "", firstName: "", lastName: "", role: "marketing_staff" });
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountNotice, setAccountNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parentOptions = useMemo(
    () => people.filter((person) => person.id !== (editing === "new" ? -1 : editing?.id)),
    [people, editing],
  );

  const startAdd = () => {
    setEditing("new");
    setDraft({ ...emptyDraft, sortOrder: people.length });
    setSelectedFile(null);
    setNotice(null);
  };

  const startEdit = (person: TeamMember) => {
    setEditing(person);
    setDraft({
      name: person.name,
      title: person.title,
      bio: person.bio,
      email: person.email,
      phone: person.phone ?? "",
      parentId: person.parentId ? String(person.parentId) : "none",
      level: person.level,
      accent: person.accent,
      sortOrder: person.sortOrder,
      imagePreview: person.imageUrl,
    });
    setSelectedFile(null);
    setNotice(null);
  };

  const cancel = () => {
    setEditing(null);
    setSelectedFile(null);
  };

  const chooseImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice({ kind: "error", text: "Please choose a JPG, PNG, or WebP image." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice({ kind: "error", text: "Profile photos must be smaller than 5 MB." });
      return;
    }
    setSelectedFile(file);
    setDraft((current) => ({ ...current, imagePreview: URL.createObjectURL(file), removeImage: false }));
  };

  const save = async () => {
    if (!draft.name.trim() || !draft.title.trim() || !draft.bio.trim() || !draft.email.trim()) {
      setNotice({ kind: "error", text: "Name, job title, biography, and email are required." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const imageObjectPath = selectedFile
        ? await uploadProfilePhoto(selectedFile)
        : draft.removeImage ? null : undefined;
      const data: TeamMemberInput = {
        name: draft.name.trim(),
        title: draft.title.trim(),
        bio: draft.bio.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim() || null,
        parentId: draft.parentId === "none" ? null : Number(draft.parentId),
        level: draft.level,
        accent: draft.accent,
        sortOrder: draft.sortOrder,
        ...(imageObjectPath !== undefined ? { imageObjectPath } : {}),
      };
      if (editing === "new") {
        await createMember.mutateAsync({ data });
        setNotice({ kind: "success", text: `${data.name} was added to the public Team page.` });
      } else if (editing) {
        await updateMember.mutateAsync({ teamMemberId: editing.id, data });
        setNotice({ kind: "success", text: `${data.name}'s public profile was updated.` });
      }
      await queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
      setEditing(null);
      setSelectedFile(null);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "The profile could not be saved." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (person: TeamMember) => {
    if (!window.confirm(`Remove ${person.name} from the public team page?`)) return;
    setNotice(null);
    try {
      await deleteMember.mutateAsync({ teamMemberId: person.id });
      await queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
      setNotice({ kind: "success", text: `${person.name} was removed from the public Team page.` });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "The profile could not be deleted." });
    }
  };

  const createStaffAccount = async () => {
    if (!accountDraft.email.trim() || accountDraft.password.length < 12) {
      setAccountNotice({ kind: "error", text: "Enter a valid email and a password with at least 12 characters." });
      return;
    }
    setCreatingAccount(true);
    setAccountNotice(null);
    try {
      const response = await fetch("/api/admin/staff-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: accountDraft.email.trim(),
          password: accountDraft.password,
          firstName: accountDraft.firstName.trim(),
          lastName: accountDraft.lastName.trim(),
          role: accountDraft.role,
        }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "The staff account could not be created.");
      setAccountNotice({ kind: "success", text: `Staff login created for ${accountDraft.email.trim()}. Share the credentials securely with that staff member.` });
      setAccountDraft({ email: "", password: "", firstName: "", lastName: "", role: "marketing_staff" });
    } catch (error) {
      setAccountNotice({ kind: "error", text: error instanceof Error ? error.message : "The staff account could not be created." });
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">People & hierarchy</p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-secondary">Manage Team</h1>
          <p className="mt-2 max-w-2xl text-gray-500">Maintain the profiles, photos, contact details, and reporting structure shown on the public Team page.</p>
        </div>
        {roleLoaded && isFullAccess && (
          <Button onClick={startAdd} className="gap-2 bg-primary text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add team member
          </Button>
        )}
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-secondary">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p>{isFullAccess
          ? <><strong>Full-access controls.</strong> Changes saved here are published to the Team page immediately.</>
          : <><strong>Restricted access.</strong> This area requires a full-access role.</>}</p>
      </div>

      {notice && (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${notice.kind === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {notice.text}
        </div>
      )}

      {roleLoaded && isFullAccess && (
        <Card className="mb-6 border-primary/20">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 font-heading text-lg"><KeyRound className="h-5 w-5 text-primary" /> Create staff login</CardTitle>
            <p className="text-sm text-gray-500">Create a secure staff login and assign the portal access that matches the person’s responsibilities.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {accountNotice && (
              <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${accountNotice.kind === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
                {accountNotice.text}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="staff-email">Staff email / username</Label>
                <Input id="staff-email" type="email" autoComplete="off" value={accountDraft.email} onChange={(event) => setAccountDraft((current) => ({ ...current, email: event.target.value }))} placeholder="staff@dithetoaccountants.co.za" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="staff-role">Portal role</Label>
                <select id="staff-role" value={accountDraft.role} onChange={(event) => setAccountDraft((current) => ({ ...current, role: event.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-secondary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="ceo">CEO — full portal rights</option>
                  <option value="senior_manager">Senior Manager — full portal rights</option>
                  <option value="marketing_staff">Staff Team — Marketing / Posters only</option>
                </select>
                <p className="text-xs text-gray-500">Full-access roles can manage clients, documents, team profiles, reminders, integrations, and staff logins.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-first-name">First name</Label>
                <Input id="staff-first-name" autoComplete="off" value={accountDraft.firstName} onChange={(event) => setAccountDraft((current) => ({ ...current, firstName: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-last-name">Last name</Label>
                <Input id="staff-last-name" autoComplete="off" value={accountDraft.lastName} onChange={(event) => setAccountDraft((current) => ({ ...current, lastName: event.target.value }))} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="staff-password">Temporary password</Label>
                <Input id="staff-password" type="password" autoComplete="new-password" minLength={12} value={accountDraft.password} onChange={(event) => setAccountDraft((current) => ({ ...current, password: event.target.value }))} placeholder="At least 12 characters" />
              </div>
            </div>
            <Button type="button" onClick={createStaffAccount} disabled={creatingAccount} className="gap-2 bg-primary text-white hover:bg-primary/90">
              {creatingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {creatingAccount ? "Creating login…" : "Create staff login"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader className="border-b"><CardTitle className="font-heading text-lg">Current organogram</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading && <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading team profiles…</div>}
            {isError && <div className="p-8 text-center text-sm text-red-600">The team profiles could not be loaded.</div>}
            {!isLoading && !isError && people.length === 0 && <div className="p-12 text-center text-sm text-gray-500">No employee profiles have been added yet.</div>}
            <div className="divide-y divide-gray-100">
              {people.map((person) => {
                const manager = people.find((candidate) => candidate.id === person.parentId);
                return (
                  <div key={person.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <TeamPhoto image={person.imageUrl} name={person.name} />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-secondary">{person.name}</p>
                        <p className="text-sm text-primary">{person.title}</p>
                        <p className="mt-1 text-xs text-gray-400">Reports to: {manager?.name ?? "Leadership"}</p>
                      </div>
                    </div>
                    {isFullAccess && (
                      <div className="flex gap-2 sm:shrink-0">
                        <Button variant="outline" size="sm" onClick={() => startEdit(person)} className="gap-2"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => remove(person)} disabled={deleteMember.isPending} className="gap-2 text-red-600 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {isFullAccess && editing ? (
          <Card className="h-fit xl:sticky xl:top-28">
            <CardHeader className="flex flex-row items-start justify-between border-b">
              <div>
                <CardTitle className="font-heading text-lg">{editing === "new" ? "Add team member" : "Edit team member"}</CardTitle>
                <p className="mt-1 text-sm text-gray-500">Changes appear on the public Team page.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={cancel} aria-label="Close editor"><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-4">
                <TeamPhoto image={draft.imagePreview} name={draft.name} large />
                <div className="flex flex-wrap gap-2">
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => chooseImage(event.target.files?.[0])} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2"><Upload className="h-3.5 w-3.5" /> Upload</Button>
                  {draft.imagePreview && <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedFile(null); setDraft((current) => ({ ...current, imagePreview: null, removeImage: true })); }} className="text-red-600">Remove</Button>}
                  <p className="w-full text-xs text-gray-400">JPG, PNG, or WebP up to 5 MB.</p>
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="team-name">Full name</Label><Input id="team-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="team-title">Job title</Label><Input id="team-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="team-bio">Short bio</Label><Textarea id="team-bio" rows={4} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="team-email">Email</Label><Input id="team-email" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="team-phone">Phone (optional)</Label><Input id="team-phone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Level</Label><Select value={draft.level} onValueChange={(value: Draft["level"]) => setDraft({ ...draft, level: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="director">Director</SelectItem><SelectItem value="lead">Manager</SelectItem><SelectItem value="team">Team</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Accent</Label><Select value={draft.accent} onValueChange={(value: Draft["accent"]) => setDraft({ ...draft, accent: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="teal">Teal</SelectItem><SelectItem value="gold">Gold</SelectItem><SelectItem value="navy">Navy</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label>Reports to</Label><Select value={draft.parentId} onValueChange={(value) => setDraft({ ...draft, parentId: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Leadership / no manager</SelectItem>{parentOptions.map((person) => <SelectItem key={person.id} value={String(person.id)}>{person.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="flex gap-3 pt-2">
                <Button onClick={save} disabled={saving} className="flex-1 bg-primary text-white hover:bg-primary/90">{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save profile"}</Button>
                <Button variant="outline" onClick={cancel} disabled={saving}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-fit bg-secondary text-white">
            <CardContent className="p-6">
              <ImagePlus className="h-8 w-8 text-accent" />
              <p className="mt-4 text-sm font-bold uppercase tracking-wider text-accent">{isFullAccess ? "Organogram controls" : "Team directory"}</p>
              <h2 className="mt-3 font-heading text-2xl font-bold">{isFullAccess ? "Keep every public profile current." : "Employee profiles are protected."}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">{isFullAccess ? "Add or select a person to maintain titles, biographies, contact details, photos, and reporting relationships." : "A full-access role is required to publish profile changes."}</p>
              {isFullAccess && <Button onClick={startAdd} className="mt-6 gap-2 bg-accent text-secondary hover:bg-accent/90"><Plus className="h-4 w-4" /> Add a profile</Button>}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}