import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Calculator, Check, FileSpreadsheet, BriefcaseBusiness, BookOpen, MessageCircle, HardHat, Building2, Database, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import heroOne from "@assets/ditheto-accountants-hero_1789472037427.jpg";
import heroTwo from "@assets/ditheto-accountants-hero-v2_1789472037428.jpg";
import heroThree from "@assets/ditheto-accountants-hero-v3_1789472037429.jpg";
import heroFour from "@assets/ditheto-accountants-hero-v4_1789472037429.jpg";

const heroImages = [heroOne, heroTwo, heroThree, heroFour];

function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const showSlide = (index: number) => {
    setDirection(index >= activeSlide ? 1 : -1);
    setActiveSlide((index + heroImages.length) % heroImages.length);
  };

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveSlide((current) => (current + 1) % heroImages.length);
    }, 7200);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="group relative h-full min-h-[280px] overflow-hidden rounded-[1.75rem] shadow-[0_35px_110px_-48px_rgba(46,188,179,.55),0_30px_80px_-46px_rgba(0,0,0,.9)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Ditheto Accountants welcome images"
    >
      <div className="relative h-full min-h-[280px] overflow-hidden rounded-[1.75rem]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={activeSlide}
            src={heroImages[activeSlide]}
            alt={`Ditheto Accountants welcome image ${activeSlide + 1}`}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 45 : -45, scale: 1.02 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? -45 : 45, scale: 1.01 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-secondary/20 via-transparent to-secondary/10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-secondary/35 to-transparent" />
      </div>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => showSlide(index)}
            className={`h-1.5 rounded-full shadow-sm transition-all ${index === activeSlide ? "w-6 bg-accent" : "w-1.5 bg-white/60 hover:bg-white"}`}
            aria-label={`Show carousel image ${index + 1}`}
            aria-current={index === activeSlide ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

const services = [
  { number: "01", title: "Tax services", description: "ITR12, IRP6, VAT201, PAYE and SARS support — submitted accurately and ahead of time.", icon: Calculator, href: "/services/tax", count: "13 services" },
  { number: "02", title: "Payroll services", description: "Confidential payroll that runs on time, so your team is paid correctly and your returns look after themselves.", icon: FileSpreadsheet, href: "/services/payroll", count: "6 services" },
  { number: "03", title: "Registration & consulting", description: "Get your entity registered properly and presented professionally, from CIPC to tender-ready profiles.", icon: BriefcaseBusiness, href: "/services/registration", count: "4 services" },
  { number: "04", title: "Accounting & bookkeeping", description: "Books that are current, reconciled and useful — so you always know what the business is doing.", icon: BookOpen, href: "/services/accounting", count: "4 services" },
  { number: "05", title: "CIDB registration", description: "Register or renew your construction business with the CIDB and stay ready for tender opportunities.", icon: HardHat, href: "/services/cidb-registration", count: "2 services" },
  { number: "06", title: "Company registration", description: "Start and maintain your company with CIPC registrations, amendments, annual returns and beneficial ownership filings.", icon: Building2, href: "/services/company-registration", count: "4 services" },
  { number: "07", title: "CSD registration", description: "Register or update your supplier profile on the Central Supplier Database for government opportunities.", icon: Database, href: "/services/csd-registration", count: "2 services" },
  { number: "08", title: "COIDA registration", description: "Register with the Compensation Fund and complete the annual renewal due at the end of April.", icon: ShieldCheck, href: "/services/coida-registration", count: "2 services" },
];

const proofPoints = [
  "South African tax and compliance expertise",
  "Clear advice without accounting jargon",
  "One accountable team from filing to follow-up",
];

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      <section className="noise relative bg-secondary text-white">
        <div className="absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full border border-primary/20 bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-px w-1/2 bg-white/10" />
        <div className="site-container relative z-10">
          <div className="grid min-h-[700px] items-start gap-10 py-16 lg:items-stretch lg:grid-cols-[.78fr_1.22fr] lg:grid-rows-[auto_auto] lg:py-24">
            <p className="mb-0 flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-accent lg:col-start-1 lg:row-start-1">
              <span className="h-px w-9 bg-accent" /> Built for the filing season
            </p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, ease: [0.22, 1, .36, 1] }} className="max-w-3xl lg:col-start-1 lg:row-start-2">
              <h1 className="serif-display text-balance text-5xl leading-[.98] sm:text-6xl lg:text-[5.6rem]">
                Accounting and tax you <em className="text-accent">never</em> have to chase.
              </h1>
              <p className="mt-8 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                We handle SARS submissions, payroll and company registrations for individuals and businesses across Pretoria and Secunda. Proudly black-owned, built on one promise — integrity you can count on.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/quote" className="button-shine inline-flex h-14 items-center justify-center gap-2 rounded-sm bg-accent px-7 text-sm font-bold text-secondary transition-transform hover:-translate-y-1" data-testid="link-home-quote">
                  Request a quote <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a href="https://wa.me/27677657387" target="_blank" rel="noopener noreferrer" className="inline-flex h-14 items-center justify-center gap-2 rounded-sm border border-white/30 px-7 text-sm font-bold text-white transition-colors hover:border-primary hover:bg-primary/20" data-testid="link-home-whatsapp">
                  <MessageCircle className="h-4 w-4 text-accent" /> Chat on WhatsApp
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, delay: .15, ease: [0.22, 1, .36, 1] }} className="min-w-0 lg:col-start-2 lg:row-start-2 lg:h-full lg:-mr-14 xl:-mr-24">
              <HeroCarousel />
            </motion.div>
          </div>
          <div className="grid border-t border-white/15 sm:grid-cols-4">
            {[
              ["Provisional tax", "IRP6 · twice a year"],
              ["Tax season", "ITR12 · opens 1 July"],
              ["VAT201", "Every second month"],
              ["EMP201", "Monthly · due the 7th"],
            ].map(([label, value], index) => (
              <div key={label} className={`border-white/15 py-5 ${index > 0 ? "border-l pl-5 sm:pl-6" : ""}`}>
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="mt-1 text-xs text-slate-400">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-28">
        <div className="site-container">
          <Reveal className="max-w-2xl">
            <p className="eyebrow mb-5">Everything in one place</p>
            <h2 className="serif-display text-balance text-4xl leading-[1.02] text-secondary sm:text-5xl">Clear numbers. Calm decisions. A firm that follows through.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">Eight focused service areas, one accountable team. Open any of them to see exactly what is included before you ask for a quote.</p>
          </Reveal>
          <div className="mt-14 border-t editorial-rule">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Reveal key={service.title} delay={index * .07}>
                  <Link href={service.href} className="group grid gap-5 border-b editorial-rule py-8 transition-colors hover:bg-primary/[.035] sm:grid-cols-[70px_1fr_auto] sm:items-center sm:px-4" data-testid={`link-home-service-${service.number}`}>
                    <span className="serif-display text-3xl text-secondary/20">{service.number}</span>
                    <div>
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-primary" />
                        <h3 className="serif-display text-2xl text-secondary sm:text-3xl">{service.title}</h3>
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{service.description}</p>
                    </div>
                    <span className="flex items-center gap-2 text-xs font-bold text-primary sm:justify-self-end">{service.count}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-10">
            <Link href="/services" className="inline-flex items-center gap-2 text-sm font-bold text-secondary underline decoration-primary/50 underline-offset-8 transition-colors hover:text-primary" data-testid="link-home-all-services">
              Explore all services <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-muted/55 py-20 sm:py-28">
        <div className="site-container grid gap-14 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <Reveal>
            <p className="eyebrow mb-5">The Ditheto difference</p>
            <h2 className="serif-display max-w-md text-4xl leading-[1.02] text-secondary sm:text-5xl">The right answer, before it becomes urgent.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">Good accounting is more than a submission. It is knowing where you stand, what is due next and who is already on it.</p>
            <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-secondary" data-testid="link-home-about">
              Meet the firm <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="grid gap-0 border-t editorial-rule">
            {proofPoints.map((point, index) => (
              <Reveal key={point} delay={index * .1}>
                <div className="flex gap-5 border-b editorial-rule py-7">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white"><Check className="h-4 w-4" /></span>
                  <div>
                    <p className="font-bold text-secondary">{point}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{["SARS rules change. Our work stays current, careful and documented.", "You should be able to understand your numbers without a dictionary.", "From first registration to monthly books, your context stays with us."][index]}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-white sm:py-20">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Let's get it sorted</p>
            <h2 className="serif-display mt-4 max-w-2xl text-4xl leading-[1] sm:text-5xl">Your next filing does not need to become a fire drill.</h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/75">Tell us what you need and we will come back with a clear, tailored quote.</p>
          </div>
          <Link href="/quote" className="inline-flex h-14 items-center justify-center gap-2 rounded-sm bg-accent px-7 text-sm font-bold text-secondary transition-transform hover:-translate-y-1" data-testid="link-home-final-quote">
            Start with a quote <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}