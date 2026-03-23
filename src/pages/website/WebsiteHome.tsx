import { Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Eye,
  Brain,
  Zap,
  FileText,
  Package,
  Truck,
  Receipt,
  Gavel,
  ChevronRight,
  Play,
} from "lucide-react";

const benefits = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Complete Control",
    description: "Single source of truth for all operational data. Every order, document, and transaction tracked.",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Real-Time Visibility",
    description: "End-to-end tracking across all shipments and workflows. Know exactly where everything stands.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Built-In Compliance",
    description: "Automated document generation with version control, approvals, and full audit trails.",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Actionable Intelligence",
    description: "AI-powered insights and recommendations that drive better decisions, faster.",
  },
];

const modules = [
  {
    icon: <Package className="h-8 w-8" />,
    title: "Order Management",
    description: "The execution spine. Create, track, and manage orders with complete lifecycle visibility.",
    href: "/website/solutions/orders",
    color: "from-teal to-teal-dark",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "Document Intelligence",
    description: "Auto-generate, validate, and manage documents linked to your operational context.",
    href: "/website/solutions/documents",
    color: "from-ocean to-ocean-light",
  },
  {
    icon: <Gavel className="h-8 w-8" />,
    title: "Procurement & Auctions",
    description: "Run RFQs and blind reverse auctions. Vendors see only their rank, ensuring fair competition.",
    href: "/website/solutions/procurement",
    color: "from-teal to-ocean",
  },
  {
    icon: <Truck className="h-8 w-8" />,
    title: "Tracking & Visibility",
    description: "Multi-modal tracking with predictive ETAs and exception alerts connected to orders.",
    href: "/website/solutions/tracking",
    color: "from-ocean-light to-teal-light",
  },
  {
    icon: <Receipt className="h-8 w-8" />,
    title: "Invoice Reconciliation",
    description: "Match invoices with contracts, orders, and documents. Highlight discrepancies automatically.",
    href: "/website/solutions/invoices",
    color: "from-teal-dark to-ocean",
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: "AI Decision Engine",
    description: "Predictive insights and recommendations with explainable AI. No black boxes.",
    href: "/website/solutions/ai",
    color: "from-ocean to-teal",
  },
];

const stats = [
  { value: "40%", label: "Reduction in manual work" },
  { value: "3x", label: "Faster execution cycles" },
  { value: "99.9%", label: "Data accuracy" },
  { value: "60%", label: "Lower operational risk" },
];

const trustedBy = [
  "Fortune 500 Enterprises",
  "Global 3PLs",
  "Manufacturing Leaders",
  "Retail Giants",
];

export default function WebsiteHome() {
  return (
    <WebsiteLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background pb-20 pt-16 lg:pb-32 lg:pt-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-teal/10 to-ocean/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-br from-ocean/10 to-teal/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4 py-1.5">
              <Zap className="h-4 w-4 text-teal" />
              <span className="text-sm font-medium text-teal">AI-Powered Operations Platform</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The Execution Backbone for{" "}
              <span className="bg-gradient-to-r from-teal to-ocean bg-clip-text text-transparent">
                Enterprise Operations
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground lg:text-xl">
              End-to-end visibility, control, and intelligence across orders, documents, procurement, 
              tracking, and invoicing. One platform. Complete operational command.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean px-8 hover:opacity-90">
                <Link to="/website/demo">
                  Request a Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link to="/website/platform">
                  <Play className="h-4 w-4" />
                  Explore Platform
                </Link>
              </Button>
            </div>
          </div>

          {/* Platform Architecture Diagram */}
          <div className="mx-auto mt-16 max-w-5xl lg:mt-24">
            <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6 lg:p-10">
                <div className="mb-8 text-center">
                  <h2 className="text-lg font-semibold text-foreground">How It All Connects</h2>
                  <p className="mt-1 text-sm text-muted-foreground">From orders to intelligence — a unified execution layer</p>
                </div>
                
                {/* Flow Diagram */}
                <div className="flex flex-wrap items-center justify-center gap-4 lg:flex-nowrap lg:gap-2">
                  {[
                    { icon: <Package className="h-5 w-5" />, label: "Orders" },
                    { icon: <Truck className="h-5 w-5" />, label: "Execution" },
                    { icon: <FileText className="h-5 w-5" />, label: "Documents" },
                    { icon: <Receipt className="h-5 w-5" />, label: "Invoices" },
                    { icon: <Brain className="h-5 w-5" />, label: "AI Insights" },
                  ].map((item, index, arr) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal/10 to-ocean/10 text-teal">
                          {item.icon}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                      </div>
                      {index < arr.length - 1 && (
                        <ChevronRight className="hidden h-5 w-5 text-muted-foreground/50 lg:block" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
              Why Enterprise Leaders Choose Foraxis
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for scale, trust, and long-term adoption by global operations teams.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="group border-border/50 bg-card/50 transition-all hover:border-teal/30 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal/10 to-ocean/10 text-teal transition-transform group-hover:scale-110">
                    {benefit.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Modules */}
      <section className="bg-secondary/30 py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
              Modular Platform, Unified Experience
            </h2>
            <p className="text-lg text-muted-foreground">
              Each module works independently. Together, they form a complete operational command center.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Link key={module.title} to={module.href} className="group">
                <Card className="h-full border-border/50 bg-card transition-all hover:border-teal/30 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${module.color} text-white transition-transform group-hover:scale-110`}>
                      {module.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">{module.title}</h3>
                    <p className="mb-4 flex-1 text-sm text-muted-foreground">{module.description}</p>
                    <div className="flex items-center text-sm font-medium text-teal">
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-teal to-ocean p-8 lg:p-12">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
                Measurable Impact, Real Results
              </h2>
              <p className="text-lg text-white/80">
                Enterprise teams using Foraxis see transformative improvements across their operations.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mb-2 text-4xl font-bold text-white lg:text-5xl">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-t border-border/40 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Trusted by industry leaders worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {trustedBy.map((company) => (
              <div
                key={company}
                className="text-lg font-semibold text-muted-foreground/60"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary/30 py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
              Ready to Transform Your Operations?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              See how Foraxis can become the execution backbone of your enterprise. 
              Request a personalized demo with our team.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean px-8 hover:opacity-90">
                <Link to="/website/demo">
                  Request a Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/website/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
