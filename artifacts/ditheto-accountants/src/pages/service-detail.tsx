import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowUpRight, CheckCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { serviceCategories } from "@/pages/services";

export default function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const category = serviceCategories.find((item) => item.id === serviceId);

  if (!category) {
    return (
      <div className="site-container py-28 text-center">
        <p className="eyebrow">Service not found</p>
        <h1 className="serif-display mt-4 text-5xl text-secondary">This service page is unavailable.</h1>
        <Link href="/services" className="mt-8 inline-flex items-center gap-2 font-bold text-primary"><ArrowLeft className="h-4 w-4" /> View all services</Link>
      </div>
    );
  }

  const Icon = category.icon;
  const related = serviceCategories.filter((item) => item.id !== category.id);

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="noise relative overflow-hidden bg-secondary py-20 text-white sm:py-28">
        <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="site-container relative z-10">
          <Reveal>
            <Link href="/services" className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-white/65 transition-colors hover:text-accent">
              <ArrowLeft className="h-4 w-4" /> All services
            </Link>
            <div className="flex items-start gap-5">
              <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-accent"><Icon className="h-5 w-5" /></span>
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-accent">{category.items.length} professional services</p>
                <h1 className="serif-display max-w-4xl text-5xl leading-[.98] sm:text-7xl">{category.title}</h1>
                <p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{category.description}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <main className="site-container mt-14 sm:mt-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px] lg:items-start">
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-primary/25 border-t-4 border-t-primary bg-card shadow-[0_18px_45px_-35px_hsl(var(--secondary)/.7)]">
              <Accordion type="multiple" defaultValue={[`${category.id}-0`]} className="w-full">
                {category.items.map((item, index) => (
                  <AccordionItem value={`${category.id}-${index}`} key={item.name} className="border-b border-foreground/10 px-5 last:border-0 sm:px-7">
                    <AccordionTrigger className="gap-4 py-6 text-left font-heading text-base font-bold text-secondary hover:no-underline hover:text-primary sm:text-lg">
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-3">
                          <span>{item.name}</span>
                          {index === 0 && <span className="rounded-full bg-accent/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">Most requested</span>}
                        </span>
                        <span className="mt-2 block max-w-3xl text-xs font-normal leading-5 text-muted-foreground sm:text-sm">{item.desc}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-7">
                      <p className="mb-4 text-sm font-bold text-secondary">What’s included</p>
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {item.benefits.map((benefit) => <li key={benefit} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"><CheckCircle className="mt-1 h-4 w-4 shrink-0 text-primary" />{benefit}</li>)}
                      </ul>
                      <Link href={`/quote?service=${encodeURIComponent(item.name)}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-secondary">
                        Request a quote <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Reveal>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="rounded-2xl bg-secondary p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Need this service?</p>
              <h2 className="serif-display mt-3 text-3xl">Let’s make the next step clear.</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">Tell us what you need and our team will prepare a tailored response.</p>
              <Link href={`/quote?service=${encodeURIComponent(category.title)}`} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-accent px-4 text-sm font-bold text-secondary">
                Request a quote <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-secondary/10 bg-card p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-secondary/55">Other services</p>
              {related.map((item) => <Link key={item.id} href={`/services/${item.id}`} className="block border-t border-secondary/10 py-3 text-sm font-semibold text-secondary transition-colors hover:text-primary">{item.title}</Link>)}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}