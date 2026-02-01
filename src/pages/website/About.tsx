import { Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Target, Eye, Heart, Users, Globe, Zap } from "lucide-react";

const values = [
  {
    icon: <Target className="h-6 w-6" />,
    title: "Execution Focus",
    description: "We build systems that make things happen, not just systems that show what happened.",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Transparency",
    description: "Our AI is explainable. Our pricing is clear. Our processes are visible.",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Customer Obsession",
    description: "Every feature, every decision, every line of code is judged by customer impact.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Partnership Mindset",
    description: "We succeed when our customers succeed. We're partners, not just vendors.",
  },
];

const leadership = [
  { name: "Alexandra Chen", role: "CEO & Co-Founder", background: "Ex-McKinsey, Ex-Flexport" },
  { name: "Marcus Williams", role: "CTO & Co-Founder", background: "Ex-Google, Ex-Uber Freight" },
  { name: "Dr. Sarah Okonkwo", role: "Chief AI Officer", background: "Ex-DeepMind, Stanford PhD" },
  { name: "David Kowalski", role: "Chief Revenue Officer", background: "Ex-SAP, Ex-Oracle" },
];

const milestones = [
  { year: "2022", event: "Company founded in San Francisco" },
  { year: "2023", event: "Series A funding, 50+ enterprise customers" },
  { year: "2024", event: "Series B, expanded to Europe and Asia" },
  { year: "2025", event: "500+ customers, AI platform launch" },
  { year: "2026", event: "Market leader in operational execution" },
];

export default function About() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/50 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Building the Execution Backbone for{" "}
              <span className="bg-gradient-to-r from-teal to-ocean bg-clip-text text-transparent">
                Enterprise Operations
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              OpsFlow was founded on a simple belief: enterprises deserve better than dashboards and 
              spreadsheets. They deserve systems that actually execute.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-teal/30 bg-gradient-to-br from-teal/5 to-transparent">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10">
                  <Target className="h-6 w-6 text-teal" />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Our Mission</h2>
                <p className="text-muted-foreground">
                  To transform how enterprises manage operations by replacing fragmented tools with a 
                  unified, intelligent execution platform. We eliminate the chaos of spreadsheets, 
                  emails, and disconnected systems.
                </p>
              </CardContent>
            </Card>
            <Card className="border-ocean/30 bg-gradient-to-br from-ocean/5 to-transparent">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ocean/10">
                  <Eye className="h-6 w-6 text-ocean" />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Our Vision</h2>
                <p className="text-muted-foreground">
                  A world where every enterprise has the operational precision of the best-run companies. 
                  Where AI amplifies human judgment. Where execution is a competitive advantage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/30 py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title} className="border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-ocean text-white">
                    {value.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Leadership Team</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {leadership.map((person) => (
              <Card key={person.name} className="border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal/10 to-ocean/10">
                    <Users className="h-10 w-10 text-teal" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{person.name}</h3>
                  <p className="mb-2 text-sm font-medium text-teal">{person.role}</p>
                  <p className="text-xs text-muted-foreground">{person.background}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-secondary/30 py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Our Journey</h2>
          <div className="mx-auto max-w-2xl">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="relative flex gap-6 pb-8">
                {index < milestones.length - 1 && (
                  <div className="absolute left-[19px] top-10 h-full w-0.5 bg-teal/30" />
                )}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-ocean text-sm font-bold text-white">
                  {milestone.year.slice(2)}
                </div>
                <div>
                  <div className="mb-1 text-lg font-semibold text-foreground">{milestone.year}</div>
                  <p className="text-muted-foreground">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-teal to-ocean p-8 lg:p-12">
            <div className="grid gap-8 text-center md:grid-cols-4">
              <div>
                <div className="mb-2 text-4xl font-bold text-white">500+</div>
                <div className="text-white/80">Enterprise Customers</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-white">50+</div>
                <div className="text-white/80">Countries Served</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-white">$10B+</div>
                <div className="text-white/80">Transactions Processed</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-white">200+</div>
                <div className="text-white/80">Team Members</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary/30 py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Join Our Mission</h2>
            <p className="mb-8 text-muted-foreground">
              We're always looking for talented people who want to transform enterprise operations.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
                <Link to="/website/careers">
                  View Open Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/website/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
