import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Users, Target, Shield } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="noise relative bg-secondary py-24 text-center">
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h1 className="display-title mb-6 text-4xl font-bold text-white md:text-6xl">About Ditheto Accountants</h1>
          <p className="text-xl text-gray-300">
            A 100% black-owned professional accounting firm bringing integrity, precision, and dedication to South African businesses.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <Reveal>
              <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">Our Story</h2>
              <h3 className="text-3xl font-heading font-bold text-secondary mb-6">Empowering Business Growth Through Financial Clarity</h3>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Ditheto Accountants (Pty) Ltd was founded with a clear vision: to provide accessible, high-quality financial services to businesses and individuals who demand excellence. Based in Gauteng and Mpumalanga, our roots run deep in the communities we serve.
                </p>
                <p>
                  As a proudly 100% black-owned South African firm, we understand the unique challenges facing local entrepreneurs. We don't just process numbers; we partner with our clients to ensure they are structured correctly, compliant with SARS and other regulatory bodies, and positioned for sustainable growth.
                </p>
                <p className="font-semibold text-secondary pt-2 border-l-4 border-accent pl-4 italic">
                  "Our tagline 'Integrity You Can Count On' isn't just a marketing slogan — it's the foundational principle that guides every tax return we submit and every set of accounts we balance."
                </p>
               </div>
             </Reveal>
             <Reveal className="grid grid-cols-2 gap-4" delay={.1}>
              <Card className="bg-gray-50 border-none shadow-md">
                <CardContent className="p-8 text-center">
                  <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h4 className="font-heading font-bold text-xl text-secondary mb-2">100%</h4>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Black-Owned</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-none shadow-md translate-y-8">
                <CardContent className="p-8 text-center">
                  <Shield className="h-10 w-10 text-accent mx-auto mb-4" />
                  <h4 className="font-heading font-bold text-xl text-secondary mb-2">SARS</h4>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Compliant</p>
                </CardContent>
              </Card>
              <Card className="bg-primary border-none shadow-md">
                <CardContent className="p-8 text-center">
                  <Target className="h-10 w-10 text-white mx-auto mb-4" />
                  <h4 className="font-heading font-bold text-xl text-white mb-2">2</h4>
                  <p className="text-sm text-primary-foreground/80 font-medium uppercase tracking-wide">Branches</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary border-none shadow-md translate-y-8">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-4" />
                  <h4 className="font-heading font-bold text-xl text-white mb-2">Integrity</h4>
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">Guaranteed</p>
                </CardContent>
              </Card>
             </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/60 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-secondary mb-12">Our Core Values</h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Reveal className="lift-card rounded-2xl border border-secondary/10 bg-card p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold text-secondary mb-4">Integrity</h3>
              <p className="text-gray-600">Honesty and transparency in every interaction. We do what is right, even when no one is looking, ensuring your finances are always handled ethically.</p>
            </Reveal>
            
            <Reveal delay={.08} className="lift-card rounded-2xl border border-secondary/10 bg-card p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-heading font-bold text-secondary mb-4">Accuracy</h3>
              <p className="text-gray-600">Precision in numbers is non-negotiable. From complex tax submissions to daily bookkeeping, we pride ourselves on meticulous attention to detail.</p>
            </Reveal>
            
            <Reveal delay={.16} className="lift-card rounded-2xl border border-secondary/10 bg-card p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-secondary mb-4">Reliability</h3>
              <p className="text-gray-600">You can count on us to meet deadlines and deliver on our promises. We take the stress out of compliance so you have peace of mind.</p>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
