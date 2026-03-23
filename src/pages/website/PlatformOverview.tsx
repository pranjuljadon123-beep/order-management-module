import { Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Package,
  FileText,
  Gavel,
  Truck,
  Receipt,
  Brain,
  Layers,
  Shield,
  RefreshCw,
  ChevronRight,
  Check,
} from "lucide-react";

const modules = [
  {
    icon: <Package className="h-6 w-6" />,
    title: "Order Management",
    description: "The central execution spine. All operations start and flow through orders.",
    href: "/website/solutions/orders",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Document Intelligence",
    description: "Smart document creation, version control, and compliance automation.",
    href: "/website/solutions/documents",
  },
  {
    icon: <Gavel className="h-6 w-6" />,
    title: "Procurement & Auctions",
    description: "RFQs, vendor management, and blind reverse auctions.",
    href: "/website/solutions/procurement",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Tracking & Visibility",
    description: "Multi-modal tracking with predictive ETAs and exception alerts.",
    href: "/website/solutions/tracking",
  },
  {
    icon: <Receipt className="h-6 w-6" />,
    title: "Invoice Reconciliation",
    description: "Automated matching and discrepancy detection.",
    href: "/website/solutions/invoices",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI Decision Engine",
    description: "Predictive insights with explainable AI recommendations.",
    href: "/website/solutions/ai",
  },
];

const principles = [
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Modular by Design",
    description: "Deploy what you need. Each module works independently but connects seamlessly with others.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Enterprise-Grade Security",
    description: "SOC 2 compliant, end-to-end encryption, and granular access controls.",
  },
  {
    icon: <RefreshCw className="h-6 w-6" />,
    title: "Built for Integration",
    description: "REST APIs, webhooks, and pre-built connectors for your existing systems.",
  },
];

const capabilities = [
  "Single source of truth for all operational data",
  "Real-time visibility across all workflows",
  "Automated document generation and compliance",
  "AI-powered predictions and recommendations",
  "Blind reverse auctions for fair procurement",
  "Multi-modal shipment tracking",
  "Invoice matching and discrepancy alerts",
  "Complete audit trails and version history",
];

export default function PlatformOverview() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/50 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              One Platform for Complete{" "}
              <span className="bg-gradient-to-r from-teal to-ocean bg-clip-text text-transparent">
                Operational Control
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Foraxis is the execution backbone for enterprise operations. We connect orders, documents, 
              procurement, tracking, and invoicing into a unified system of record — with AI intelligence 
              layered on top.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
              <Link to="/website/demo">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              System of Record + System of Intelligence
            </h2>
            <p className="text-lg text-muted-foreground">
              We don't just track data — we make it actionable. Every module feeds into our 
              AI engine for predictive insights and automated recommendations.
            </p>
          </div>

          {/* Flow Visualization */}
          <Card className="mx-auto mb-16 max-w-5xl overflow-hidden border-border/50">
            <CardContent className="p-8 lg:p-12">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* System of Record */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10">
                      <Layers className="h-5 w-5 text-teal" />
                    </div>
                    <h3 className="text-xl font-semibold">System of Record</h3>
                  </div>
                  <p className="text-muted-foreground">
                    The foundational layer. Every order, document, shipment, and invoice is 
                    captured with full audit trails and version control.
                  </p>
                  <ul className="space-y-2">
                    {["Orders & Execution", "Documents & Compliance", "Procurement & Contracts", "Tracking & Events"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-teal" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* System of Intelligence */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean/10">
                      <Brain className="h-5 w-5 text-ocean" />
                    </div>
                    <h3 className="text-xl font-semibold">System of Intelligence</h3>
                  </div>
                  <p className="text-muted-foreground">
                    AI agents analyze your operational data to predict issues, recommend 
                    actions, and automate decisions — with full explainability.
                  </p>
                  <ul className="space-y-2">
                    {["Predictive ETAs & Delays", "Document Risk Scoring", "Invoice Discrepancy Detection", "Procurement Optimization"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-ocean" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Link key={module.title} to={module.href} className="group">
                <Card className="h-full border-border/50 transition-all hover:border-teal/30 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal/10 to-ocean/10 text-teal transition-transform group-hover:scale-110">
                      {module.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{module.title}</h3>
                    <p className="mb-4 flex-1 text-sm text-muted-foreground">{module.description}</p>
                    <div className="flex items-center text-sm font-medium text-teal">
                      Explore
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Principles */}
      <section className="bg-secondary/30 py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Built for Enterprise Scale</h2>
            <p className="text-lg text-muted-foreground">
              Designed from day one for the demands of global enterprise operations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {principles.map((principle) => (
              <Card key={principle.title} className="border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-ocean text-white">
                    {principle.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{principle.title}</h3>
                  <p className="text-sm text-muted-foreground">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities List */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                Everything You Need to Run Operations at Scale
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Foraxis provides the complete toolkit for enterprise operations teams. 
                From execution to intelligence, every capability is built-in and connected.
              </p>
              <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
                <Link to="/website/demo">
                  See It In Action
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {capabilities.map((capability) => (
                <div key={capability} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal/10">
                    <Check className="h-3 w-3 text-teal" />
                  </div>
                  <span className="text-sm text-foreground">{capability}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-teal to-ocean py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
              Ready to See the Platform in Action?
            </h2>
            <p className="mb-8 text-lg text-white/80">
              Schedule a personalized demo with our team and see how Foraxis can 
              transform your operations.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/website/demo">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
