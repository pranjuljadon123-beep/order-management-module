import { useState } from "react";
import { Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Shield, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const trustSignals = [
  { icon: <Shield className="h-5 w-5" />, text: "Enterprise-grade security" },
  { icon: <Clock className="h-5 w-5" />, text: "30-minute demo, no commitment" },
  { icon: <Users className="h-5 w-5" />, text: "Dedicated solutions team" },
];

const whatYouGet = [
  "Personalized walkthrough of the platform",
  "Use case analysis for your operations",
  "Integration and implementation roadmap",
  "Pricing tailored to your needs",
  "Q&A with our solutions team",
];

export default function DemoRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "Demo request received!",
      description: "Our team will contact you within 24 hours to schedule your demo.",
    });
    
    setIsSubmitting(false);
  };

  return (
    <WebsiteLayout>
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Info */}
            <div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                See OpsFlow{" "}
                <span className="bg-gradient-to-r from-teal to-ocean bg-clip-text text-transparent">
                  in Action
                </span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Get a personalized demo of the platform. Our solutions team will show 
                you how OpsFlow can transform your operations.
              </p>

              {/* What You Get */}
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  What you'll see in the demo:
                </h2>
                <ul className="space-y-3">
                  {whatYouGet.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal/10">
                        <Check className="h-3 w-3 text-teal" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-4">
                {trustSignals.map((signal) => (
                  <div
                    key={signal.text}
                    className="flex items-center gap-2 rounded-full border border-border/50 bg-secondary/30 px-4 py-2"
                  >
                    <span className="text-teal">{signal.icon}</span>
                    <span className="text-sm text-muted-foreground">{signal.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Form */}
            <div>
              <Card className="border-border/50">
                <CardContent className="p-6 lg:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" placeholder="John" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" placeholder="Smith" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email *</Label>
                      <Input id="email" type="email" placeholder="john@company.com" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input id="company" placeholder="Acme Inc." required />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="role">Your Role *</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operations">Operations Lead</SelectItem>
                            <SelectItem value="supply-chain">Supply Chain Director</SelectItem>
                            <SelectItem value="logistics">Logistics Manager</SelectItem>
                            <SelectItem value="finance">Finance Director</SelectItem>
                            <SelectItem value="it">IT / Technology</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">Region *</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="north-america">North America</SelectItem>
                            <SelectItem value="europe">Europe</SelectItem>
                            <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                            <SelectItem value="middle-east">Middle East</SelectItem>
                            <SelectItem value="latin-america">Latin America</SelectItem>
                            <SelectItem value="africa">Africa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="useCase">Primary Use Case</Label>
                      <Textarea
                        id="useCase"
                        placeholder="Tell us about your operations and what challenges you're looking to solve..."
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-teal to-ocean hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Request Demo"}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      By submitting, you agree to our{" "}
                      <Link to="#" className="underline hover:text-foreground">
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link to="#" className="underline hover:text-foreground">
                        Terms of Service
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
