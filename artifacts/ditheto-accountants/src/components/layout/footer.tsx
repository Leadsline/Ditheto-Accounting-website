import { Link } from "wouter";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";
import logo from "@assets/Logo_NRG_1789474380486.png";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-accent/60 bg-secondary pb-8 pt-16 text-white">
      <div className="site-container">
        <div className="mb-14 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_.7fr_1fr_1fr]">
          
          <div className="space-y-6">
            <div className="inline-block rounded-xl bg-[#f2eee4]/90 px-3 py-2.5 shadow-[0_12px_30px_-18px_rgba(0,0,0,.9)] ring-1 ring-white/10 backdrop-blur-sm">
              <img src={logo} alt="Ditheto Accountants" className="h-12 w-auto" />
            </div>
            <p className="max-w-sm pr-4 text-sm leading-relaxed text-gray-300">
              A 100% black-owned South African accounting, tax, payroll, bookkeeping, and business registration firm serving Pretoria and Secunda. Integrity you can count on.
            </p>
             <div className="flex gap-2">
               <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/10 text-white transition-colors hover:bg-primary">
                <Facebook className="h-4 w-4" />
              </a>
                <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/10 text-white transition-colors hover:bg-primary">
                <Instagram className="h-4 w-4" />
              </a>
                <a href="#" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/10 text-white transition-colors hover:bg-primary">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
             <h3 className="mb-6 flex items-center gap-2 text-lg font-heading font-bold">
               <span className="h-1 w-4 bg-accent"></span> Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-accent transition-colors block">Home</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-accent transition-colors block">Our Services</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-accent transition-colors block">About Us</Link></li>
              <li><Link href="/team" className="text-gray-300 hover:text-accent transition-colors block">Our Team</Link></li>
              <li><Link href="/quote" className="text-gray-300 hover:text-accent transition-colors block">Request a Quote</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-accent transition-colors block">Contact Us</Link></li>
            </ul>
          </div>

          <div>
             <h3 className="mb-6 flex items-center gap-2 text-lg font-heading font-bold">
               <span className="h-1 w-4 bg-accent"></span> Pretoria Branch
            </h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span>No 238 Justice Mahomed Street,<br />Brooklyn, Pretoria, 0181</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <span>067 765 7387 <br/> 012 751 3200</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <a href="mailto:admin@dithetoaccountants.co.za" className="hover:text-white">admin@dithetoaccountants.co.za</a>
              </li>
            </ul>
          </div>

          <div>
             <h3 className="mb-6 flex items-center gap-2 text-lg font-heading font-bold">
               <span className="h-1 w-4 bg-accent"></span> Secunda Branch
            </h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span>Shop No 25 Sanlam Plaza,<br />Horwood Street, Secunda, 2302</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <span>071 478 1810 <br/> 017 631 1890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <a href="mailto:secunda@dithetoaccountants.co.za" className="hover:text-white">secunda@dithetoaccountants.co.za</a>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Ditheto Accountants (Pty) Ltd. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
