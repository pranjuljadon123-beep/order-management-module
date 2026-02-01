import { Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Briefcase, Users, Heart, Rocket, Coffee } from "lucide-react";

const benefits = [
  { icon: <Heart className="h-5 w-5" />, title: "Health & Wellness", description: "Comprehensive medical, dental, and vision. Mental health support included." },
  { icon: <Rocket className="h-5 w-5" />, title: "Growth", description: "Learning budget, conference attendance, and career development programs." },
  { icon: <Coffee className="h-5 w-5" />, title: "Flexibility", description: "Remote-first culture. Work from anywhere. Flexible hours." },
  { icon: <Users className="h-5 w-5" />, title: "Equity", description: "Stock options. Share in our success as we grow together." },
];

const openings = [
  { title: "Senior Backend Engineer", department: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Product Manager - AI", department: "Product", location: "San Francisco", type: "Full-time" },
  { title: "Enterprise Account Executive", department: "Sales", location: "New York", type: "Full-time" },
  { title: "Solutions Architect", department: "Solutions", location: "Remote", type: "Full-time" },
  { title: "Senior Data Scientist", department: "AI/ML", location: "Remote", type: "Full-time" },
  { title: "Customer Success Manager", department: "Customer Success", location: "London", type: "Full-time" },
];

export default function Careers() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/50 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Build the Future of{" "}
              <span className="bg-gradient-to-r from-teal to-ocean bg-clip-text text-transparent">
                Enterprise Operations
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Join a team of passionate builders, operators, and problem-solvers transforming 
              how the world's largest companies run their operations.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
              <a href="#openings">
                View Open Positions
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Why OpsFlow */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Why OpsFlow?</h2>
            <p className="text-muted-foreground">
              We're solving hard problems at the intersection of operations, AI, and enterprise software.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">Real Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Our software moves billions of dollars in goods. Your work affects how 
                  enterprises operate globally.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">Hard Problems</h3>
                <p className="text-sm text-muted-foreground">
                  Distributed systems, machine learning, complex integrations. We tackle 
                  challenges that push the boundaries.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">Growing Fast</h3>
                <p className="text-sm text-muted-foreground">
                  We're scaling rapidly with customers who love us. Join now and grow with the company.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-secondary/30 py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Benefits & Perks</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-border/50">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10 text-teal">
                    {benefit.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Open Positions</h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {openings.map((job) => (
              <Card key={job.title} className="border-border/50 transition-all hover:border-teal/30 hover:shadow-lg">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{job.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Briefcase className="h-3 w-3" />
                        {job.department}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </Badge>
                      <Badge variant="outline">{job.type}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="shrink-0">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">
              Don't see a role that fits? We're always looking for exceptional talent.
            </p>
            <Button variant="outline" asChild>
              <Link to="/website/contact">Send us your resume</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-teal to-ocean py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">Ready to Join?</h2>
            <p className="mb-8 text-white/80">
              Apply today and help us build the future of enterprise operations.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <a href="#openings">
                View All Openings
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
