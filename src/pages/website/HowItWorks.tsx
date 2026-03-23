import { Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Package, FileText, Truck, Receipt, Brain, ChevronRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Package className="h-6 w-6" />,
    title: "Capture Orders",
    description: "Orders enter the system from your ERP, customer portals, or manual entry. Each order becomes the anchor for all related activities.",
  },
  {
    number: "02",
    icon: <FileText className="h-6 w-6" />,
    title: "Generate Documents",
    description: "Documents are auto-generated from order data. Compliance validation runs automatically. Approvals flow through configurable workflows.",
  },
  {
    number: "03",
    icon: <Truck className="h-6 w-6" />,
    title: "Track Execution",
    description: "Shipments are tracked across all modes. Predictive ETAs update in real-time. Exceptions trigger proactive alerts.",
  },
  {
    number: "04",
    icon: <Receipt className="h-6 w-6" />,
    title: "Reconcile & Pay",
    description: "Invoices are matched to orders, contracts, and actual execution. Discrepancies are flagged automatically. Approved invoices flow to payment.",
  },
  {
    number: "05",
    icon: <Brain className="h-6 w-6" />,
    title: "Learn & Improve",
    description: "AI analyzes every transaction. Patterns emerge. Recommendations improve. Your operations get smarter over time.",
  },
];

const integrations = [
  { name: "SAP", category: "ERP" },
  { name: "Oracle", category: "ERP" },
  { name: "Microsoft Dynamics", category: "ERP" },
  { name: "NetSuite", category: "ERP" },
  { name: "Salesforce", category: "CRM" },
  { name: "Blue Yonder", category: "WMS" },
  { name: "Manhattan", category: "WMS" },
  { name: "Maersk", category: "Carrier" },
  { name: "MSC", category: "Carrier" },
  { name: "CMA CGM", category: "Carrier" },
];

export default function HowItWorks() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/50 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              How Foraxis{" "}
              <span className="bg-gradient-to-r from-teal to-ocean bg-clip-text text-transparent">
                Works
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              From order creation to payment reconciliation, see how Foraxis connects 
              every step of your operational workflow into a unified, intelligent system.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-16 h-full w-0.5 bg-gradient-to-b from-teal/50 to-transparent" />
                  )}
                  
                  <Card className="relative border-border/50 transition-all hover:border-teal/30 hover:shadow-lg">
                    <CardContent className="flex gap-6 p-6 lg:p-8">
                      {/* Number & Icon */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-ocean text-white">
                          {step.icon}
                        </div>
                        <span className="text-xs font-bold text-teal">{step.number}</span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="bg-secondary/30 py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Connects to Your Existing Systems
            </h2>
            <p className="text-lg text-muted-foreground">
              Foraxis integrates with your ERP, WMS, TMS, and carrier systems. 
              Pre-built connectors and REST APIs make integration fast.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap justify-center gap-4">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center gap-2 rounded-full border border-border/50 bg-background px-4 py-2"
                >
                  <span className="font-medium text-foreground">{integration.name}</span>
                  <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs text-teal">
                    {integration.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Implementation */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                Go Live in Weeks, Not Months
              </h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Our implementation methodology gets you operational quickly. Start with core 
                modules and expand as needed.
              </p>
              <ul className="space-y-4">
                {[
                  "Week 1-2: Discovery and configuration",
                  "Week 3-4: Integration and data migration",
                  "Week 5-6: User training and pilot",
                  "Week 7+: Go-live and optimization",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <ChevronRight className="h-5 w-5 text-teal" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-5xl font-bold text-teal">6</div>
                  <div className="mb-2 text-lg font-semibold text-foreground">Weeks to Value</div>
                  <p className="text-sm text-muted-foreground">
                    Average time from contract to go-live for enterprise customers
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-teal to-ocean py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
              Ready to See Foraxis in Action?
            </h2>
            <p className="mb-8 text-lg text-white/80">
              Schedule a demo and see how Foraxis can transform your operations.
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
