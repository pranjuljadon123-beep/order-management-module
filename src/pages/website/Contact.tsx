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
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const offices = [
  { city: "San Francisco", address: "100 Market Street, Suite 500", country: "United States" },
  { city: "London", address: "10 Finsbury Square", country: "United Kingdom" },
  { city: "Singapore", address: "1 Raffles Place", country: "Singapore" },
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setIsSubmitting(false);
  };

  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/50 to-background py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Get in{" "}
              <span className="bg-gradient-to-r from-teal to-ocean bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions about Foraxis? Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/50 text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
                  <Mail className="h-6 w-6 text-teal" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Email Us</h3>
                <a href="mailto:hello@opsflow.com" className="text-teal hover:underline">
                  hello@opsflow.com
                </a>
              </CardContent>
            </Card>
            <Card className="border-border/50 text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
                  <Phone className="h-6 w-6 text-teal" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Call Us</h3>
                <a href="tel:+1-888-OPS-FLOW" className="text-teal hover:underline">
                  +1 (888) OPS-FLOW
                </a>
              </CardContent>
            </Card>
            <Card className="border-border/50 text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
                  <MessageSquare className="h-6 w-6 text-teal" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Live Chat</h3>
                <p className="text-sm text-muted-foreground">Available Mon-Fri, 9am-6pm EST</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form & Offices */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">Send Us a Message</h2>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" placeholder="John Smith" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" placeholder="john@company.com" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" placeholder="Acme Inc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">Request a Demo</SelectItem>
                          <SelectItem value="sales">Sales Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="press">Press/Media</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="How can we help you?"
                        rows={5}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal to-ocean hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Offices */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">Our Offices</h2>
              <div className="space-y-4">
                {offices.map((office) => (
                  <Card key={office.city} className="border-border/50">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal/10">
                        <MapPin className="h-5 w-5 text-teal" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{office.city}</h3>
                        <p className="text-sm text-muted-foreground">{office.address}</p>
                        <p className="text-sm text-muted-foreground">{office.country}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Ready to see Foraxis in action?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Skip the form and schedule a demo directly with our solutions team.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
              <Link to="/website/demo">Request a Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
