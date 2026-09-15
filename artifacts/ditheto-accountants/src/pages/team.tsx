import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Phone, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { useListTeamMembers } from "@workspace/api-client-react";

type TeamMember = {
  id: number;
  name: string;
  title: string;
  bio: string;
  email: string;
  phone?: string | null;
  initials: string;
  image?: string | null;
  accent: "teal" | "gold" | "navy";
  level: "director" | "lead" | "team";
  parentId?: number | null;
  sortOrder: number;
};

const accentClasses = {
  teal: "border-primary bg-primary/10 text-primary",
  gold: "border-accent bg-accent/10 text-amber-700",
  navy: "border-secondary bg-secondary/10 text-secondary",
};

function ProfileAvatar({ member, size = "md" }: { member: TeamMember; size?: "sm" | "md" | "lg" }) {
  const [imageFailed, setImageFailed] = useState(false);

  const dims = size === "lg" ? "h-24 w-24 text-2xl" : size === "sm" ? "h-16 w-16 text-lg" : "h-20 w-20 text-xl";

  if (member.image && !imageFailed) {
    return (
      <img
        src={member.image}
        alt={`${member.name} profile`}
        onError={() => setImageFailed(true)}
        className={`${dims} rounded-full border-4 border-white object-cover shadow-md ring-2 ring-primary/20 shrink-0`}
      />
    );
  }
  return (
    <div className={`${dims} rounded-full border-4 ${accentClasses[member.accent]} flex items-center justify-center font-heading font-bold shadow-sm shrink-0`}>
      {member.initials}
    </div>
  );
}

function MemberCard({ member, onSelect, compact = false, variant = "default" }: { member: TeamMember; onSelect: (member: TeamMember) => void; compact?: boolean, variant?: "default" | "solid" }) {
  const isSolid = variant === "solid";
  
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(member)}
      whileHover={{ y: -5 }}
      transition={{ duration: .25 }}
      className={`group flex w-full flex-col items-center justify-start rounded-2xl border text-center shadow-[0_12px_30px_-20px_hsl(var(--secondary))] transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 
      ${isSolid 
        ? "border-secondary bg-secondary text-white hover:border-primary hover:shadow-lg" 
        : "border-secondary/15 bg-card hover:border-primary/45 hover:shadow-lg"
      } 
      ${compact ? "h-[210px] px-3 py-5" : "h-[250px] px-6 py-6"}`}
    >
      <ProfileAvatar member={member} size={compact ? "sm" : "md"} />
      <span className="mt-4 flex w-full min-w-0 flex-1 flex-col items-center">
        <span className={`block w-full font-heading font-bold leading-tight transition-colors ${isSolid ? "text-white" : "text-secondary group-hover:text-primary"} ${compact ? "text-[13px]" : "text-base"}`}>
          {member.name}
        </span>
        <span className={`mx-auto mt-2 flex w-full max-w-[95%] items-center justify-center rounded-full border px-2 py-1 font-bold uppercase leading-tight tracking-[.08em] ${
          isSolid 
            ? "border-white/20 bg-white/10 text-white/90" 
            : "border-secondary/15 bg-background text-secondary/70"
        } ${compact ? "text-[8px] min-h-[24px]" : "text-[9px] min-h-[28px]"}`}>
          <span className="line-clamp-2">{member.title}</span>
        </span>
        <span className={`mt-auto inline-flex items-center gap-1 pt-3 font-semibold uppercase tracking-wider ${isSolid ? "text-primary/90" : "text-primary"} ${compact ? "text-[9px]" : "text-xs"}`}>
          View profile <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </motion.button>
  );
}

export default function Team() {
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const { data, isLoading, isError } = useListTeamMembers();
  
  const team = useMemo<TeamMember[]>(() => (data ?? []).map((member) => ({
    id: member.id,
    name: member.name,
    title: member.title,
    bio: member.bio,
    email: member.email,
    phone: member.phone,
    initials: member.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "??",
    image: member.imageUrl,
    accent: member.accent,
    level: member.level,
    parentId: member.parentId,
    sortOrder: member.sortOrder,
  })), [data]);

  const director = useMemo(() => team.find((member) => member.level === "director" && !member.parentId), [team]);
  const seniorManager = useMemo(
    () => team.find((member) => member.level === "lead" && member.parentId === director?.id),
    [team, director],
  );
  
  // Connect to Senior Manager if present, else directly to CEO
  const branchManagers = useMemo(
    () => team.filter((member) => member.level === "lead" && (seniorManager ? member.parentId === seniorManager.id : member.parentId === director?.id))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    [team, seniorManager, director],
  );

  const branches = useMemo(() => {
    return branchManagers.map(manager => {
      const assistants = team.filter((member) => member.level === "team" && member.parentId === manager.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return { manager, assistants };
    });
  }, [branchManagers, team]);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-secondary py-20 text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
              <UsersRound className="h-4 w-4" /> The people behind the numbers
            </div>
            <h1 className="font-heading text-4xl font-bold leading-tight md:text-6xl">Meet the Ditheto team.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl">
              A connected team of accountants, tax specialists, and client partners committed to making every financial decision clearer.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-4">Our team structure</p>
            <h2 className="serif-display text-4xl leading-none text-secondary sm:text-5xl">The right people in the right place.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Our Brooklyn and Secunda teams bring together specialist knowledge and personal attention. Select any team member to learn more about the person supporting your business.
            </p>
          </Reveal>

          <Reveal className="mt-16" delay={.12}>
            {isLoading && <div className="rounded-3xl border border-secondary/10 bg-card p-12 text-center text-muted-foreground">Loading team structure…</div>}
            {isError && <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">The team structure could not be loaded. Please try again shortly.</div>}
            {!isLoading && !isError && (
              <div className="overflow-hidden rounded-3xl border border-secondary/10 bg-card py-10 sm:py-16 px-4 shadow-[0_24px_70px_-50px_hsl(var(--secondary))]">
                
                {/* DESKTOP LAYOUT (Vertical Rails) */}
                <div className="hidden lg:flex flex-col items-center w-full max-w-7xl mx-auto">
                  {director && (
                    <div className="relative flex justify-center w-full">
                      <div className="w-[280px]">
                        <MemberCard member={director} onSelect={setSelected} variant="solid" />
                      </div>
                      
                      {/* HR Outsourced Box */}
                      <div className="absolute left-[calc(50%+140px)] top-1/2 -translate-y-1/2 flex items-center shrink-0 z-10">
                        <div className="w-8 xl:w-20 border-t-2 border-dashed border-accent/70 shrink-0" />
                        <div className="w-[200px] xl:w-[220px] rounded-xl border-2 border-dashed border-accent/70 bg-accent/5 p-4 text-center shrink-0">
                          <p className="text-[9px] font-bold uppercase tracking-[.16em] text-amber-700">Outsourced service</p>
                          <p className="mt-1 font-heading font-bold text-secondary text-sm">HR Function</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">NPM Consulting</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {seniorManager && (
                    <>
                      <div className="w-[2px] h-10 bg-primary/40 shrink-0" />
                      <div className="w-[300px]">
                        <MemberCard member={seniorManager} onSelect={setSelected} />
                      </div>
                    </>
                  )}

                  {branches.length > 0 && (
                    <>
                      <div className="w-[2px] h-10 bg-primary/40 shrink-0" />
                      <div 
                        className="w-full grid" 
                        style={{ gridTemplateColumns: `repeat(${branches.length}, minmax(0, 1fr))` }}
                      >
                        {branches.map((branch, idx) => {
                          const branchName = branch.manager.title.includes("—") ? branch.manager.title.split("—")[1]?.trim() : "Branch";
                          
                          return (
                            <div key={branch.manager.id} className="flex flex-col items-center relative">
                              {/* Horizontal connector line drawn between centers of the grid columns */}
                              {branches.length > 1 && (
                                <div className="absolute top-0 w-full h-8 flex">
                                  <div className={`w-1/2 border-t-2 border-primary/40 ${idx === 0 ? 'border-transparent' : ''}`} />
                                  <div className={`w-1/2 border-t-2 border-primary/40 ${idx === branches.length - 1 ? 'border-transparent' : ''}`} />
                                </div>
                              )}
                              
                              <div className="w-[2px] h-8 bg-primary/40 shrink-0" />
                              
                              <div className="mb-4 inline-flex rounded-full bg-secondary px-4 py-1.5 shadow-sm relative z-10">
                                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white">{branchName}</p>
                              </div>
                              
                              <div className="w-[280px]">
                                <MemberCard member={branch.manager} onSelect={setSelected} />
                              </div>
                              
                              {/* Vertical assistants rail */}
                              {branch.assistants.map(ast => (
                                <div key={ast.id} className="flex flex-col items-center w-full">
                                  <div className="w-[2px] h-6 bg-primary/40 shrink-0" />
                                  <div className="w-[240px]">
                                    <MemberCard member={ast} onSelect={setSelected} compact />
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* MOBILE LAYOUT (Stacked) */}
                <div className="flex lg:hidden flex-col items-center w-full max-w-sm mx-auto">
                  {director && (
                    <div className="w-full">
                      <MemberCard member={director} onSelect={setSelected} variant="solid" />
                    </div>
                  )}

                  {director && (
                    <>
                      <div className="h-8 w-0 border-l-2 border-dashed border-accent/70 shrink-0" />
                      <div className="w-full rounded-xl border-2 border-dashed border-accent/70 bg-accent/5 p-4 text-center shadow-sm">
                        <p className="text-[9px] font-bold uppercase tracking-[.16em] text-amber-700">Outsourced service</p>
                        <p className="mt-1 font-heading font-bold text-secondary text-sm">HR Function</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">NPM Consulting</p>
                      </div>
                    </>
                  )}

                  {seniorManager && (
                    <>
                      <div className="h-8 w-[2px] bg-primary/40 shrink-0" />
                      <div className="w-full">
                        <MemberCard member={seniorManager} onSelect={setSelected} />
                      </div>
                    </>
                  )}

                  {branches.map(branch => {
                    const branchName = branch.manager.title.includes("—") ? branch.manager.title.split("—")[1]?.trim() : "Branch";
                    return (
                      <div key={branch.manager.id} className="flex flex-col items-center w-full mt-2">
                        <div className="h-8 w-[2px] bg-primary/40 shrink-0" />
                        
                        <div className="mb-4 inline-flex rounded-full bg-secondary px-4 py-1.5 shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white">{branchName}</p>
                        </div>
                        
                        <div className="w-full">
                          <MemberCard member={branch.manager} onSelect={setSelected} />
                        </div>
                        
                        {branch.assistants.map(ast => (
                          <div key={ast.id} className="flex flex-col items-center w-full">
                            <div className="h-6 w-[2px] bg-primary/40 shrink-0" />
                            <div className="w-[85%]">
                              <MemberCard member={ast} onSelect={setSelected} compact />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </Reveal>

          <Reveal className="mx-auto mt-16 max-w-3xl rounded-2xl border border-primary/15 bg-primary/5 p-6 sm:p-8" delay={.18}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex gap-4">
                <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-secondary"><strong>Integrity first.</strong> Every client relationship is built on discretion, accuracy, and honest advice.</p>
              </div>
              <div className="flex gap-4">
                <Sparkles className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
                <p className="text-sm leading-relaxed text-secondary"><strong>Practical support.</strong> We explain the detail without making it feel complicated.</p>
              </div>
            </div>
          </Reveal>

          <div className="mt-12 text-center">
            <Link href="/quote" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary">
              Work with our team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg rounded-3xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <ProfileAvatar member={selected} size="lg" />
                  <div>
                    <DialogTitle className="font-heading text-2xl text-secondary">{selected.name}</DialogTitle>
                    <DialogDescription className="mt-1 font-semibold text-primary">{selected.title}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <p className="mt-4 leading-relaxed text-gray-600">{selected.bio}</p>
              <div className="mt-4 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-3 text-secondary hover:text-primary">
                  <Mail className="h-4 w-4 text-primary" /> {selected.email}
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-secondary hover:text-primary">
                    <Phone className="h-4 w-4 text-primary" /> {selected.phone}
                  </a>
                )}
              </div>
              <Button asChild className="mt-2 bg-primary text-white hover:bg-primary/90">
                <Link href="/quote">Start a conversation</Link>
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
