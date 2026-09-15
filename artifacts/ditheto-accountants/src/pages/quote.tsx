import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, Building2, User, Phone, Mail } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

// Organize full catalogue
const serviceCatalogue = {
  "Tax Services": [
    "ITR12 Tax Return Submission", "IRP6 Provisional Tax", "Tax Refund Assistance", 
    "SARS eFiling Assistance", "Tax Compliance Checks", "Correction of Previous Returns", 
    "Auto Assessment Review", "SARS Queries & Verification", "VAT 201 Submissions", 
    "EMP201 / EMP501", "IT14 / ITR14 Business Tax", "Tax Clearance Certificates", 
    "Tax Registrations"
  ],
  "Payroll Services": [
    "Payslips", "EMP201", "UIF Declarations", "Salary Calculations", 
    "Full Payroll Processing", "Employee Benefits Administration"
  ],
  "Registration & Consulting": [
    "Co-operative Registration", "NPO Registration", "Company Profiles", "Business Consulting"
  ],
  "Accounting & Bookkeeping": [
    "Monthly Bookkeeping", "Management Accounts", "Bank Reconciliations", "Mentoring"
  ],
  "CIDB Registration": [
    "CIDB Registration", "CIDB Renewals (3-year renewals)"
  ],
  "Company Registration": [
    "Company Registration", "Company Amendments", "Annual Returns (AR)", "Beneficial Ownership (BO)"
  ],
  "CSD Registration": [
    "CSD Registration", "CSD Amendments"
  ],
  "COIDA Registration": [
    "COIDA Registration", "COIDA Renewal (due every end of April)"
  ]
};

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  company: z.string().optional(),
  branch: z.enum(["pretoria", "secunda"], {
    required_error: "Please select a branch preference",
  }),
  services: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You must select at least one service.",
  }),
  message: z.string().optional(),
});

export default function Quote() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Extract pre-selected service from URL if any
  const searchParams = new URLSearchParams(window.location.search);
  const preselectedService = searchParams.get("service");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      branch: "pretoria",
      services: preselectedService ? [preselectedService] : [],
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call for now since we have no backend
    setTimeout(() => {
      console.log("Form data:", values);
      toast({
        title: "Request Submitted Successfully",
        description: "We have received your quotation request and will contact you shortly.",
        variant: "default",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-muted/60 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 rounded-full bg-accent/20 items-center justify-center text-accent mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-4">Request a Quotation</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the services you need, provide your details, and our team will get back to you with a customized, transparent quote.
          </p>
        </Reveal>

        <Reveal delay={.1}>
        <Card className="border-t-4 border-t-primary bg-card shadow-lg">
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-heading font-bold text-secondary border-b pb-2 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Your Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-secondary font-semibold">Full Name *</FormLabel>
                          <FormControl>
                             <Input placeholder="Your full name" {...field} className="bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-secondary font-semibold">Company Name (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                               <Input placeholder="Your company name" {...field} className="pl-9 bg-white" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-secondary font-semibold">Email Address *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input type="email" placeholder="john@example.com" {...field} className="pl-9 bg-white" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-secondary font-semibold">Phone Number *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <Input placeholder="082 123 4567" {...field} className="pl-9 bg-white" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Branch Preference */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-heading font-bold text-secondary border-b pb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> Branch Preference
                  </h3>
                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col sm:flex-row gap-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 bg-gray-50 border border-gray-200 p-4 rounded-lg flex-1 cursor-pointer hover:bg-primary/5 transition-colors">
                              <FormControl>
                                <RadioGroupItem value="pretoria" />
                              </FormControl>
                              <FormLabel className="font-semibold cursor-pointer w-full">
                                Pretoria Branch
                                <span className="block text-xs text-gray-500 font-normal mt-1">Brooklyn, Pretoria</span>
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 bg-gray-50 border border-gray-200 p-4 rounded-lg flex-1 cursor-pointer hover:bg-primary/5 transition-colors">
                              <FormControl>
                                <RadioGroupItem value="secunda" />
                              </FormControl>
                              <FormLabel className="font-semibold cursor-pointer w-full">
                                Secunda Branch
                                <span className="block text-xs text-gray-500 font-normal mt-1">Sanlam Plaza, Secunda</span>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Services Selection */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-heading font-bold text-secondary border-b pb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Select Required Services
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="services"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormDescription>
                            Select one or more services from our catalogue below.
                          </FormDescription>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                          {Object.entries(serviceCatalogue).map(([category, items]) => (
                            <div key={category} className="space-y-3 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                              <h4 className="font-heading font-bold text-primary text-sm uppercase tracking-wider">{category}</h4>
                              {items.map((item) => (
                                <FormField
                                  key={item}
                                  control={form.control}
                                  name="services"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(item)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, item])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== item
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal text-gray-700 cursor-pointer">
                                          {item}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                        <FormMessage className="mt-4" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Info */}
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-secondary font-semibold">Additional Information / Special Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us more about your specific needs..." 
                            className="resize-none h-32 bg-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6 border-t flex justify-end">
                  <Button type="submit" size="lg" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white font-bold px-8 w-full md:w-auto h-14">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Submit Request <Send className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </Reveal>
      </div>
    </div>
  );
}
