import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building2, ExternalLink, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Send, Twitter, UserRound } from "lucide-react";
import { useCreateContactSubmission } from "@workspace/api-client-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const branches = [
  {
    name: "Pretoria Branch (Brooklyn)",
    mapQuery: "238 Justice Mahomed Street Brooklyn Pretoria 0181",
    address: ["No 238 Justice Mahomed Street", "Brooklyn, Pretoria", "0181"],
    phones: ["067 765 7387", "012 751 3200"],
    email: "admin@dithetoaccountants.co.za",
    whatsapp: "https://wa.me/27677657387",
    accent: "primary",
  },
  {
    name: "Secunda Branch",
    mapQuery: "Sanlam Plaza Horwood Street Secunda 2302",
    address: ["Shop No 25 Sanlam Plaza", "Horwood Street, Secunda", "2302"],
    phones: ["071 478 1810", "017 631 1890"],
    email: "secunda@dithetoaccountants.co.za",
    whatsapp: "https://wa.me/27714781810",
    accent: "primary",
  },
] as const;

const serviceOptions = [
  "Tax Services",
  "Payroll Services",
  "Registration & Consulting",
  "Accounting & Bookkeeping",
  "Other / Multiple services",
] as const;

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(10, "Enter a valid phone number."),
  clientType: z.enum(["individual", "business"]),
  companyName: z.string().trim().optional(),
  companyRegistrationNumber: z.string().trim().optional(),
  vatNumber: z.string().trim().optional(),
  serviceRequest: z.enum(serviceOptions, { required_error: "Select a service." }),
  message: z.string().trim().max(3000, "Message must be 3,000 characters or fewer.").optional(),
}).superRefine((value, context) => {
  if (value.clientType === "business" && !value.companyName) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["companyName"], message: "Company name is required for business clients." });
  }
});

export default function Contact() {
  const { toast } = useToast();
  const createSubmission = useCreateContactSubmission();
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      clientType: "individual",
      companyName: "",
      companyRegistrationNumber: "",
      vatNumber: "",
      message: "",
    },
  });
  const clientType = form.watch("clientType");

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    try {
      await createSubmission.mutateAsync({
        data: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          clientType: values.clientType,
          companyName: values.clientType === "business" ? values.companyName || null : null,
          companyRegistrationNumber: values.clientType === "business" ? values.companyRegistrationNumber || null : null,
          vatNumber: values.clientType === "business" ? values.vatNumber || null : null,
          serviceRequest: values.serviceRequest,
          message: values.message || null,
        },
      });
      toast({
        title: "Message sent",
        description: "Thank you. The Ditheto team will contact you shortly.",
      });
      form.reset();
    } catch {
      toast({
        title: "Message not sent",
        description: "Please check your details and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-secondary py-16 text-white sm:py-24">
        <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="site-container">
          <Reveal className="relative z-10 max-w-3xl">
            <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-accent"><span className="h-px w-9 bg-accent" /> Contact Ditheto</p>
            <h1 className="serif-display text-5xl leading-[.98] sm:text-7xl">Tell us how we can help.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Share your details and service requirements. Our team will review your request and respond with a clear next step.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-24">
        <div className="site-container">
          <Reveal className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-3xl border border-primary/15 border-t-4 border-t-primary bg-card shadow-[0_28px_70px_-48px_hsl(var(--secondary))]">
              <div className="border-b border-secondary/10 bg-muted/30 px-6 py-6 sm:px-9">
                <p className="eyebrow">Contact form</p>
                <h2 className="serif-display mt-2 text-3xl text-secondary sm:text-4xl">Submit your request</h2>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-9 p-6 sm:p-9">
                  <fieldset className="space-y-5">
                    <legend className="flex items-center gap-3 font-heading text-lg font-bold text-secondary"><UserRound className="h-5 w-5 text-primary" /> Client Details</legend>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input autoComplete="name" placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email Address *</FormLabel><FormControl><Input type="email" autoComplete="email" placeholder="name@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem className="sm:col-span-2"><FormLabel>Phone Number *</FormLabel><FormControl><Input type="tel" autoComplete="tel" placeholder="e.g. 082 123 4567" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </fieldset>

                  <fieldset className="space-y-5 border-t border-secondary/10 pt-8">
                    <legend className="flex items-center gap-3 pr-4 font-heading text-lg font-bold text-secondary"><Building2 className="h-5 w-5 text-primary" /> Client Type</legend>
                    <FormField control={form.control} name="clientType" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:grid-cols-2">
                            {["individual", "business"].map((type) => (
                              <label key={type} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${field.value === type ? "border-primary bg-primary/5" : "border-secondary/15 hover:border-primary/40"}`}>
                                <RadioGroupItem value={type} /><span className="font-semibold capitalize text-secondary">{type}</span>
                              </label>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )} />
                    {clientType === "business" && (
                      <div className="grid gap-5 rounded-2xl bg-muted/40 p-5 sm:grid-cols-2">
                        <FormField control={form.control} name="companyName" render={({ field }) => (
                          <FormItem className="sm:col-span-2"><FormLabel>Company Name *</FormLabel><FormControl><Input autoComplete="organization" placeholder="Registered company name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="companyRegistrationNumber" render={({ field }) => (
                          <FormItem><FormLabel>Company Registration Number <span className="font-normal text-muted-foreground">(optional)</span></FormLabel><FormControl><Input placeholder="e.g. 2024/123456/07" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="vatNumber" render={({ field }) => (
                          <FormItem><FormLabel>VAT Number <span className="font-normal text-muted-foreground">(optional)</span></FormLabel><FormControl><Input placeholder="VAT registration number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    )}
                  </fieldset>

                  <fieldset className="space-y-5 border-t border-secondary/10 pt-8">
                    <legend className="flex items-center gap-3 pr-4 font-heading text-lg font-bold text-secondary"><Mail className="h-5 w-5 text-primary" /> Service Request</legend>
                    <FormField control={form.control} name="serviceRequest" render={({ field }) => (
                      <FormItem><FormLabel>Service *</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger></FormControl><SelectContent>{serviceOptions.map((service) => <SelectItem key={service} value={service}>{service}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea rows={6} placeholder="Add any details or questions that will help us understand your request." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </fieldset>

                  <Button type="submit" disabled={createSubmission.isPending} className="h-12 w-full gap-2 bg-primary text-sm font-bold text-white hover:bg-secondary sm:w-auto sm:px-8">
                    <Send className="h-4 w-4" /> {createSubmission.isPending ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/45 py-16 sm:py-24">
        <div className="site-container">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-4">Find us in person</p>
              <h1 className="serif-display text-4xl leading-none text-secondary sm:text-5xl">Our branches</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Walk-ins are welcome during office hours. If you're coming in with documents, a quick call ahead helps us have the right person ready.
              </p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="mr-1 text-xs font-bold uppercase tracking-[.16em]">Follow us</span>
              {[
                { label: "Facebook", icon: Facebook },
                { label: "Instagram", icon: Instagram },
                { label: "Twitter", icon: Twitter },
              ].map(({ label, icon: Icon }) => (
                <a key={label} href="#" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary/15 transition-colors hover:border-primary hover:text-primary">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </Reveal>

          <div className="mt-12 grid gap-7 lg:grid-cols-2">
            {branches.map((branch, index) => (
              <Reveal key={branch.name} delay={index * .1}>
                <article className="overflow-hidden rounded-2xl border border-primary/15 border-l-4 border-l-primary bg-card shadow-[0_20px_55px_-38px_hsl(var(--secondary))]">
                  <iframe
                    title={`${branch.name} map`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(branch.mapQuery)}&output=embed`}
                    className="h-64 w-full border-0 grayscale-[.15] sm:h-72"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-primary">
                          <Building2 className="h-4 w-4" />
                          <p className="text-xs font-bold uppercase tracking-[.16em]">Ditheto Accountants</p>
                        </div>
                        <h2 className="serif-display mt-3 text-3xl text-secondary">{branch.name}</h2>
                      </div>
                      <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    </div>
                    <div className="mt-6 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                      <p className="leading-6">{branch.address.map((line) => <span key={line} className="block">{line}</span>)}</p>
                      <div className="space-y-1">
                        {branch.phones.map((phone) => <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className="block transition-colors hover:text-primary">{phone}</a>)}
                        <a href={`mailto:${branch.email}`} className="mt-2 block break-words transition-colors hover:text-primary">{branch.email}</a>
                      </div>
                    </div>
                    <div className="mt-7 flex flex-col gap-3 border-t border-secondary/10 pt-5 sm:flex-row">
                      <a href={branch.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white transition-colors hover:bg-[#20bd5a]">
                        <MessageCircle className="h-4 w-4" /> WhatsApp {branch.name.split(" ")[0]}
                      </a>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-secondary/20 px-4 text-sm font-bold text-secondary transition-colors hover:border-primary hover:text-primary">
                        Get directions <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
